import React, { useEffect, useState } from "react";
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Modal,
  Fade,
  Backdrop,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { supabase } from "../../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [examenes, setExamenes] = useState([]);
  const [filterCurso, setFilterCurso] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterCiclo, setFilterCiclo] = useState("");
  const [filterPeriodo, setFilterPeriodo] = useState("");
  const [filterAnio, setFilterAnio] = useState("");
  const [selectedExamen, setSelectedExamen] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Usa fetch en vez de .then para evitar problemas de compatibilidad y CORS
    async function fetchExamenes() {
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
        console.error("Error de red o CORS:", err);
        setExamenes([]);
      }
    }
    fetchExamenes();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/");
  };

  const handleNav = (route) => {
    navigate(route);
    setSidebarOpen(false);
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

  return (
    <Box sx={{ height: "100vh", 
    width: "100vw", 
    backgroundColor: "#f0f2f5", 
    display: "flex", 
    flexDirection: "column" }}>
      <AppBar position="static" sx={{ backgroundColor: "#000000" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Panel de Evaluación de Exámenes
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
                 ExamURP
               </Typography>
             </Box>
             <List>
               <ListItem disablePadding>
                 <ListItemButton
                   selected={location.pathname === "/admin"}
                   onClick={() => handleNav("/admin")}
                 >
                   <ListItemText primary="Exámenes" />
                 </ListItemButton>
               </ListItem>
               <ListItem disablePadding>
                 <ListItemButton
                   selected={location.pathname === "/admin/agregar"}
                   onClick={() => handleNav("/admin/agregar")}
                 >
                   <ListItemText primary="Agregar Examen" />
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
               <Typography
                 variant="body1"
                 sx={{ fontWeight: "bold", color: "white" }}
               >
                 Cerrar Sesión
               </Typography>
             </Box>
           </Drawer>

      <Box sx={{ flex: 1, display: "flex", height: "100%" }}>
        <Box sx={{ flex: 1, p: { xs: 1, sm: 3 }, overflow: "auto" }}>
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
                      height: 240,
                      width: "100%",
                      maxWidth: 350,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                    onClick={() => setSelectedExamen(examen)}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                        {examen.curso}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ fontSize: 18 }}>
                        {examen.tipo} • {examen.ciclo} • {examen.año}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ fontSize: 18 }}>
                        Periodo: {examen.periodo}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )
            ))}
            
      
          </Grid>
          {/* Modal Preview */}
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
                      bgcolor: "#fafafa"
                    }}>
                      <iframe
                        src={selectedExamen.archivo_url}
                        title="Vista previa del examen"
                        width="100%"
                        height="100%"
                        style={{ minHeight: "400px", border: "none" }}
                      />
                    </Box>
                    {/* Info del examen */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 320 }}>
                      <Typography variant="h5" sx={{ fontWeight: "bold" }}>{selectedExamen.curso}</Typography>
                      <Typography variant="subtitle1" color="textSecondary">
                        {selectedExamen.tipo} • {selectedExamen.ciclo} • {selectedExamen.año}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        Periodo: {selectedExamen.periodo}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Fade>
          </Modal>
        </Box>
      </Box>
    </Box>
  );
}
// No hay nada en el código que impida que funcione en Chrome si funciona en Opera.
// Si no ves los exámenes en Chrome pero sí en Opera, revisa lo siguiente:

// 1. Borra el caché y cookies de Chrome.
// 2. Asegúrate de que no tienes extensiones de bloqueo (AdBlock, Privacy Badger, etc) que bloqueen requests a Supabase.
// 3. Abre la consola de Chrome (F12) y revisa la pestaña "Console" y "Network" para ver si hay errores de CORS, permisos, o bloqueos.
// 4. Verifica que la URL de Supabase y la clave sean correctas y públicas.
// 5. Si tu proyecto está en http://localhost y Supabase está en https://, Chrome puede bloquear por política de contenido mixto. Usa siempre https://localhost si puedes.
// 6. Si tienes configuraciones de CORS en Supabase, asegúrate de permitir el origen de tu frontend.

// El código está bien, el problema es de configuración, permisos, o caché en tu navegador Chrome.
