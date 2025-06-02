import React, { useEffect, useState } from "react";
import emailjs from 'emailjs-com';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid,
  Paper,
  TextField,
  Rating,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Modal,
  Fade,
  Backdrop,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { Menu as MenuIcon, Send as SendIcon } from "@mui/icons-material";
import { supabase } from "../../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

export default function Alumno() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [examenes, setExamenes] = useState([]);
  const [filterCurso, setFilterCurso] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterCiclo, setFilterCiclo] = useState("");
  const [filterPeriodo, setFilterPeriodo] = useState("");
  const [filterAnio, setFilterAnio] = useState("");
  const [selectedExamen, setSelectedExamen] = useState(null);
  const [comentario, setComentario] = useState("");
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [userRatings, setUserRatings] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getCurrentUser();
    fetchExamenes();
  }, []);

  useEffect(() => {
    if (currentUser && examenes.length > 0) {
      loadUserRatingsFromDB();
    }
  }, [currentUser, examenes]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user && user.email) {
        setEmail(user.email);
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    }
  };

  const fetchExamenes = async () => {
    try {
      const { data, error } = await supabase.from("examenes").select("*");
      if (error) {
        console.error("Error al obtener exámenes:", error.message);
        setExamenes([]);
      } else if (Array.isArray(data)) {
        setExamenes(data);
      } else {
        setExamenes([]);
      }
    } catch (err) {
      console.error("Error de red:", err);
      setExamenes([]);
    }
  };

  const loadUserRatingsFromDB = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('feedback_examenes')
        .select('*')
        .eq('email_estudiante', currentUser.email);

      if (error) {
        console.error('Error al cargar ratings:', error);
        return;
      }

      // Convertir los datos a un objeto con el formato { examen_id: rating }
      const ratingsMap = {};
      if (data && Array.isArray(data)) {
        data.forEach(feedback => {
          // Buscar el examen correspondiente basado en los datos del feedback
          const examen = examenes.find(e => 
            e.curso === feedback.examen_curso &&
            e.tipo === feedback.tipo &&
            e.ciclo === feedback.ciclo &&
            e.periodo === feedback.periodo &&
            e.año === feedback.año
          );
          
          if (examen) {
            ratingsMap[examen.id] = feedback.rating;
          }
        });
      }

      setUserRatings(ratingsMap);
    } catch (error) {
      console.error('Error al cargar ratings:', error);
    }
  };

  const saveUserRating = async (examenId, newRating) => {
    // Actualizar estado local inmediatamente
    const updatedRatings = { ...userRatings, [examenId]: newRating };
    setUserRatings(updatedRatings);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/");
  };

  const handleNav = (route) => {
    navigate(route);
    setSidebarOpen(false);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendFeedback = async () => {
    if (!selectedExamen) return;

    // Validaciones
    if (!email.trim()) {
      setSnackbar({
        open: true,
        message: "Por favor ingresa tu correo electrónico",
        severity: "error"
      });
      return;
    }

    if (!validateEmail(email)) {
      setSnackbar({
        open: true,
        message: "Por favor ingresa un correo electrónico válido",
        severity: "error"
      });
      return;
    }

    if (rating === 0) {
      setSnackbar({
        open: true,
        message: "Por favor selecciona una calificación",
        severity: "error"
      });
      return;
    }

    if (!comentario.trim()) {
      setSnackbar({
        open: true,
        message: "Por favor agrega un comentario",
        severity: "error"
      });
      return;
    }

    setLoading(true);

    try {
      const feedbackData = {
        examen_curso: selectedExamen.curso,
        tipo: selectedExamen.tipo,
        ciclo: selectedExamen.ciclo,
        periodo: selectedExamen.periodo,
        año: selectedExamen.año,
        rating: rating,
        comentario: comentario,
        email_estudiante: email,
        fecha: new Date().toISOString()
      };

      // Verificar si ya existe un feedback de este usuario para este examen
      const { data: existingFeedback, error: searchError } = await supabase
        .from('feedback_examenes')
        .select('*')
        .eq('email_estudiante', email)
        .eq('examen_curso', selectedExamen.curso)
        .eq('tipo', selectedExamen.tipo)
        .eq('ciclo', selectedExamen.ciclo)
        .eq('periodo', selectedExamen.periodo)
        .eq('año', selectedExamen.año);

      if (searchError) {
        throw searchError;
      }

      let dbError;
      if (existingFeedback && existingFeedback.length > 0) {
        // Actualizar feedback existente
        const { error } = await supabase
          .from('feedback_examenes')
          .update({
            rating: rating,
            comentario: comentario,
            fecha: new Date().toISOString()
          })
          .eq('id', existingFeedback[0].id);
        dbError = error;
      } else {
        // Crear nuevo feedback
        const { error } = await supabase
          .from('feedback_examenes')
          .insert([feedbackData]);
        dbError = error;
      }

      if (dbError) {
        console.error('Error al guardar feedback:', dbError);
        throw dbError;
      }

      // Guardar rating del usuario localmente también
      await saveUserRating(selectedExamen.id, rating);

      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Enviar el correo usando EmailJS
      sendEmailNotification(feedbackData);
      
      setSnackbar({
        open: true,
        message: "¡Feedback enviado exitosamente! Gracias por tu evaluación.",
        severity: "success"
      });

      // Limpiar formulario
      setComentario("");
      setRating(0);
      setSelectedExamen(null);

    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: "Error al enviar feedback. Inténtalo nuevamente.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExamenes = Array.isArray(examenes)
    ? examenes.filter(
        (examen) =>
          examen.curso?.toLowerCase().includes(filterCurso.toLowerCase()) &&
          (filterTipo ? examen.tipo === filterTipo : true) &&
          (filterCiclo ? examen.ciclo === filterCiclo : true) &&
          (filterPeriodo ? examen.periodo === filterPeriodo : true) &&
          (filterAnio ? String(examen.año) === String(filterAnio) : true)
      )
    : [];

    const registrarDescarga = async (examen) => {
      if (!currentUser || !currentUser.email) {
        console.error('Usuario no autenticado');
        return;
      }
    
      try {
        console.log('Registrando descarga para examen:', examen.id, 'Usuario:', currentUser.email);
        
        // Verificar si ya existe un registro de descarga para este usuario y examen
        const { data: existingRecord, error: searchError } = await supabase
          .from('historial_descargas')
          .select('*')
          .eq('examen_id', examen.id)
          .eq('email_estudiante', currentUser.email)
          .single();
    
        if (searchError && searchError.code !== 'PGRST116') {
          // PGRST116 = no rows found, es esperado si no existe el registro
          console.error('Error al buscar registro:', searchError);
          return;
        }
    
        if (existingRecord) {
          console.log('Actualizando registro existente');
          // Actualizar contador de descargas existente
          const { error: updateError } = await supabase
            .from('historial_descargas')
            .update({
              contador_descargas: existingRecord.contador_descargas + 1,
              fecha_descarga: new Date().toISOString()
            })
            .eq('id', existingRecord.id);
    
          if (updateError) {
            console.error('Error al actualizar descarga:', updateError);
            return;
          }
          
          console.log('Registro actualizado exitosamente');
        } else {
          console.log('Creando nuevo registro de descarga');
          // Crear nuevo registro de descarga
          const { error: insertError } = await supabase
            .from('historial_descargas')
            .insert([{
              examen_id: examen.id,
              email_estudiante: currentUser.email,
              contador_descargas: 1,
              fecha_descarga: new Date().toISOString()
            }]);
    
          if (insertError) {
            console.error('Error al registrar descarga:', insertError);
            return;
          }
          
          console.log('Nuevo registro creado exitosamente');
        }
    
        // También mantener el localStorage como respaldo
        const historialLocal = JSON.parse(localStorage.getItem('historialDescargas') || '[]');
        const descargaExistente = historialLocal.find(item => item.id === examen.id);
        
        if (descargaExistente) {
          descargaExistente.contador_descargas += 1;
          descargaExistente.fecha_descarga = new Date().toISOString();
        } else {
          historialLocal.push({
            id: examen.id,
            fecha_descarga: new Date().toISOString(),
            contador_descargas: 1
          });
        }
        
        localStorage.setItem('historialDescargas', JSON.stringify(historialLocal));
        
        console.log('Descarga registrada exitosamente en Supabase y localStorage');
      } catch (error) {
        console.error('Error al registrar descarga:', error);
      }
    };

  const sendEmailNotification = (feedbackData) => {
    emailjs.send(
      'service_noq7s49', // Tu Service ID
      'template_09fnx27', // Tu Template ID
      {
        curso: feedbackData.examen_curso,
        tipo: feedbackData.tipo,
        ciclo: feedbackData.ciclo,
        periodo: feedbackData.periodo,
        año: feedbackData.año,
        rating: feedbackData.rating,
        comentario: feedbackData.comentario,
        email_estudiante: feedbackData.email_estudiante,
        fecha: feedbackData.fecha,
      },
      'oPB-ySuH2HgAvaA6C' // Tu public key
    ).then((result) => {
      console.log('Correo enviado', result.text);
    }, (error) => {
      console.error('Error al enviar correo', error);
    });
  };

  return (
    <Box sx={{ height: "100vh", width: "100vw", backgroundColor: "#f0f2f5", display: "flex", flexDirection: "column" }}>
      <AppBar position="static" sx={{ backgroundColor: "#000000" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Portal de Exámenes - Estudiante
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 250,
            backgroundColor: "#1a512e",
            color: "white",
            backgroundImage: "none",
          },
        }}
      >
        <Box sx={{ textAlign: "center", padding: 3 }}>
                     <Box
          sx={{
            width: 110,
            height: 110,
            borderRadius: "70%",
            overflow: "hidden",
            border: "2px solid #22382b",
            boxShadow: 2,
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: 2,
            p: 1,
          }}
          >
                      <img
          src="/img/URPEXAM.png"
          alt="Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
        </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "white",
              mt: 1,
              mb: 2,
              fontSize: 22,
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
              letterSpacing: 1,
            }}
          >
            Exam URP
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#BBDEFB",
              fontSize: 14,
            }}
          >
            Portal Estudiante
          </Typography>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === "/alumno"}
              onClick={() => handleNav("/alumno")}
            >
              <ListItemText primary="Informatica" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === "/alumno/historial"}
              onClick={() => handleNav("/alumno/historial")}
            >
              <ListItemText primary="Mi Historial" />
            </ListItemButton>
          </ListItem>
        </List>
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            textAlign: "center",
            padding: 2,
            borderTop: "1px solid gray",
            "&:hover": { backgroundColor: "#22382b", cursor: "pointer" },
          }}
          onClick={() => handleNav("/")}
        >
          <Typography variant="body1" sx={{ fontWeight: "bold", color: "white" }}>
            Cerrar Sesión
          </Typography>
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, display: "flex", height: "100%" }}>
        <Box sx={{ flex: 1, p: { xs: 1, sm: 3 }, overflow: "auto" }}>
          {/* Filtros */}
          <Box
            sx={{
              mb: 4,
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: { xs: "flex-start", md: "center" },
            }}
          >
            <TextField
              label="Buscar por curso"
              variant="outlined"
              value={filterCurso}
              onChange={(e) => setFilterCurso(e.target.value)}
              sx={{ minWidth: 260, fontSize: 18 }}
              InputProps={{ sx: { fontSize: 18, height: 56 } }}
              InputLabelProps={{ sx: { fontSize: 16 } }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontSize: 16 }}>Tipo</InputLabel>
              <Select
                value={filterTipo}
                label="Tipo"
                onChange={(e) => setFilterTipo(e.target.value)}
                sx={{ fontSize: 18, height: 56 }}
              >
                <MenuItem value="">Todos los tipos</MenuItem>
                <MenuItem value="Parcial">Parcial</MenuItem>
                <MenuItem value="Final">Final</MenuItem>
                <MenuItem value="Sustitutorio">Sustitutorio</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontSize: 16 }}>Ciclo</InputLabel>
              <Select
                value={filterCiclo}
                label="Ciclo"
                onChange={(e) => setFilterCiclo(e.target.value)}
                sx={{ fontSize: 18, height: 56 }}
              >
                <MenuItem value="">Todos los ciclos</MenuItem>
                <MenuItem value="6 ciclo">6 ciclo</MenuItem>
                <MenuItem value="7 ciclo">7 ciclo</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontSize: 16 }}>Periodo</InputLabel>
              <Select
                value={filterPeriodo}
                label="Periodo"
                onChange={(e) => setFilterPeriodo(e.target.value)}
                sx={{ fontSize: 18, height: 56 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="I">I</MenuItem>
                <MenuItem value="II">II</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel sx={{ fontSize: 16 }}>Año</InputLabel>
              <Select
                value={filterAnio}
                label="Año"
                onChange={(e) => setFilterAnio(e.target.value)}
                sx={{ fontSize: 18, height: 56 }}
              >
                <MenuItem value="">Todos</MenuItem>
                {[...new Set(examenes.map((e) => e.año))]
                  .sort((a, b) => b - a)
                  .map((anio) => (
                    <MenuItem key={anio} value={anio}>
                      {anio}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          {/* Grid de exámenes */}
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{
              margin: 0,
              width: "100%",
              maxWidth: "1600px",
              mx: "auto",
            }}
          >
            {filteredExamenes.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: "center", mt: 8, color: "#888" }}>
                  <Typography variant="h6">
                    No hay exámenes para mostrar.
                  </Typography>
                </Box>
              </Grid>
            ) : (
              filteredExamenes.map((examen) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={examen.id}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      cursor: "pointer",
                      transition: "0.2s",
                      height: 280,
                      width: "100%",
                      maxWidth: 350,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      "&:hover": { backgroundColor: "#e1f5fe", transform: "translateY(-2px)" },
                      border: "1px solid #e3f2fd",
                    }}
                    onClick={() => setSelectedExamen(examen)}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, color: "#274a2a" }}>
                        {examen.curso}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ fontSize: 18 }}>
                        {examen.tipo} • {examen.ciclo} • {examen.año}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ fontSize: 18 }}>
                        Periodo: {examen.periodo}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2, width: "100%" }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Mi calificación:
                      </Typography>
                      <Rating 
                        value={userRatings[examen.id] || 0} 
                        readOnly 
                        size="large" 
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 2, width: "100%" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExamen(examen);
                        }}
                      >
                        Ver y Evaluar
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              )
            ))}
          </Grid>

          {/* Modal de evaluación */}
          <Modal
            open={!!selectedExamen}
            onClose={() => setSelectedExamen(null)}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
                sx: { backgroundColor: "rgba(0,0,0,0.5)" },
              },
            }}
          >
            <Fade in={!!selectedExamen}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: { xs: "98%", sm: "90%", md: "80%" },
                  maxWidth: 1200,
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  boxShadow: 24,
                  p: { xs: 1, sm: 3, md: 4 },
                  maxHeight: "90vh",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                {selectedExamen && (
                  <>
                    {/* Preview PDF */}
                    <Box sx={{
                      flex: 1,
                      border: "1px solid #ccc",
                      borderRadius: 2,
                      overflow: "hidden",
                      minWidth: 320,
                      minHeight: 400,
                      bgcolor: "#274a2a"
                    }}>
                      <iframe
                        src={selectedExamen.archivo_url}
                        title="Vista previa del examen"
                        width="100%"
                        height="100%"
                        style={{ minHeight: "400px", border: "none" }}
                      />
                    </Box>

                    {/* Formulario de evaluación */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 320 }}>
                      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#274a2a" }}>
                        {selectedExamen.curso}
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary">
                        {selectedExamen.tipo} • {selectedExamen.ciclo} • {selectedExamen.año}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        Periodo: {selectedExamen.periodo}
                      </Typography>

                      <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: "#274a2a" }}>
                          Evalúa este examen
                        </Typography>

                        <TextField
                          label="Tu correo electrónico"
                          type="email"
                          fullWidth
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          sx={{ mb: 2 }}
                          required
                          disabled={!!currentUser} // Deshabilitar si hay usuario autenticado
                        />

                        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                          <Typography>Calificación:</Typography>
                          <Rating
                            value={rating}
                            onChange={(_, newValue) => setRating(newValue)}
                            size="large"
                          />
                        </Box>

                        <TextField
                          label="Comentarios y sugerencias"
                          multiline
                          rows={4}
                          fullWidth
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          placeholder="Comparte tu opinión sobre la dificultad, claridad de las preguntas, tiempo asignado, etc."
                          sx={{ mb: 2 }}
                          required
                        />

                        <Button
                          variant="contained"
                          fullWidth
                          onClick={handleSendFeedback}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                          sx={{
                            bgcolor: "#4CAF50",
                            "&:hover": { bgcolor: "#274a2a" },
                            py: 1.5,
                          }}
                        >
                          {loading ? "Enviando..." : "Enviar Evaluación"}
                        </Button>

                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => {
                            registrarDescarga(selectedExamen);
                            window.open(selectedExamen.archivo_url, '_blank');
                          }}
                          sx={{ mt: 1 }}
                        >
                          Descargar PDF
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Fade>
          </Modal>

          {/* Snackbar para notificaciones */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
}