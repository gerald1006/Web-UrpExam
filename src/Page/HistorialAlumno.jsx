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
  Rating,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  Badge,
} from "@mui/material";
import { 
  Menu as MenuIcon, 
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { supabase } from "../../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

export default function HistorialAlumno() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historialDescargas, setHistorialDescargas] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [filterCurso, setFilterCurso] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterCiclo, setFilterCiclo] = useState("");
  const [filterAnio, setFilterAnio] = useState("");
  const [sortBy, setSortBy] = useState("fecha_descarga");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadHistorialDescargas();
    fetchExamenes();
    loadUserRatings();
  }, []);

  const loadHistorialDescargas = () => {
    // Cargar historial de descargas desde localStorage
    const historial = localStorage.getItem('historialDescargas');
    if (historial) {
      setHistorialDescargas(JSON.parse(historial));
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

  const loadUserRatings = () => {
    const savedRatings = localStorage.getItem('userRatings');
    if (savedRatings) {
      setUserRatings(JSON.parse(savedRatings));
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/");
  };

  const handleNav = (route) => {
    navigate(route);
    setSidebarOpen(false);
  };

  const handleDescargar = (examen) => {
    // Actualizar historial de descargas
    const nuevaDescarga = {
      id: examen.id,
      fecha_descarga: new Date().toISOString(),
      contador_descargas: getContadorDescargas(examen.id) + 1
    };

    const historialActualizado = historialDescargas.filter(item => item.id !== examen.id);
    historialActualizado.push(nuevaDescarga);
    
    setHistorialDescargas(historialActualizado);
    localStorage.setItem('historialDescargas', JSON.stringify(historialActualizado));

    // Abrir PDF
    window.open(examen.archivo_url, '_blank');
  };

  const getContadorDescargas = (examenId) => {
    const descarga = historialDescargas.find(item => item.id === examenId);
    return descarga ? descarga.contador_descargas : 0;
  };

  const getFechaUltimaDescarga = (examenId) => {
    const descarga = historialDescargas.find(item => item.id === examenId);
    return descarga ? new Date(descarga.fecha_descarga) : null;
  };

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener exámenes descargados
  const examenesDescargados = examenes.filter(examen => 
    historialDescargas.some(descarga => descarga.id === examen.id)
  );

  // Aplicar filtros
  const examenesFiltrados = examenesDescargados.filter(examen =>
    examen.curso?.toLowerCase().includes(filterCurso.toLowerCase()) &&
    (filterTipo ? examen.tipo === filterTipo : true) &&
    (filterCiclo ? examen.ciclo === filterCiclo : true) &&
    (filterAnio ? String(examen.año) === String(filterAnio) : true)
  );

  // Aplicar ordenamiento
  const examenesOrdenados = [...examenesFiltrados].sort((a, b) => {
    switch (sortBy) {
      case "fecha_descarga":
        const fechaA = getFechaUltimaDescarga(a.id);
        const fechaB = getFechaUltimaDescarga(b.id);
        return fechaB - fechaA;
      case "curso":
        return a.curso.localeCompare(b.curso);
      case "descargas":
        return getContadorDescargas(b.id) - getContadorDescargas(a.id);
      case "rating":
        return (userRatings[b.id] || 0) - (userRatings[a.id] || 0);
      default:
        return 0;
    }
  });

  const totalDescargas = historialDescargas.reduce((sum, item) => sum + item.contador_descargas, 0);
  const examenesEvaluados = Object.keys(userRatings).filter(id => userRatings[id] > 0).length;

  return (
    <Box sx={{ height: "100vh", width: "100vw", backgroundColor: "#f0f2f5", display: "flex", flexDirection: "column" }}>
      <AppBar position="static" sx={{ backgroundColor: "#000000" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Mi Historial de Exámenes
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

      <Box sx={{ flex: 1, p: { xs: 1, sm: 3 }, overflow: "auto" }}>
        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", p: 2, bgcolor: "#e3f2fd" }}>
              <Typography variant="h4" sx={{ color: "#1565C0", fontWeight: "bold" }}>
                {examenesDescargados.length}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Exámenes Descargados
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", p: 2, bgcolor: "#f3e5f5" }}>
              <Typography variant="h4" sx={{ color: "#7B1FA2", fontWeight: "bold" }}>
                {totalDescargas}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Total Descargas
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", p: 2, bgcolor: "#e8f5e8" }}>
              <Typography variant="h4" sx={{ color: "#388E3C", fontWeight: "bold" }}>
                {examenesEvaluados}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Exámenes Evaluados
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center", p: 2, bgcolor: "#fff3e0" }}>
              <Typography variant="h4" sx={{ color: "#F57C00", fontWeight: "bold" }}>
                {examenesDescargados.length > 0 ? 
                  (Object.values(userRatings).reduce((sum, rating) => sum + rating, 0) / 
                   Object.values(userRatings).filter(r => r > 0).length || 0).toFixed(1) : '0.0'}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Rating Promedio
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros y ordenamiento */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            p: 3,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <TextField
            label="Buscar por curso"
            variant="outlined"
            value={filterCurso}
            onChange={(e) => setFilterCurso(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
          />
          
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filterTipo}
              label="Tipo"
              onChange={(e) => setFilterTipo(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Parcial">Parcial</MenuItem>
              <MenuItem value="Final">Final</MenuItem>
              <MenuItem value="Sustitutorio">Sustitutorio</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Ciclo</InputLabel>
            <Select
              value={filterCiclo}
              label="Ciclo"
              onChange={(e) => setFilterCiclo(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="6 ciclo">6 ciclo</MenuItem>
              <MenuItem value="7 ciclo">7 ciclo</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Año</InputLabel>
            <Select
              value={filterAnio}
              label="Año"
              onChange={(e) => setFilterAnio(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {[...new Set(examenesDescargados.map((e) => e.año))]
                .sort((a, b) => b - a)
                .map((anio) => (
                  <MenuItem key={anio} value={anio}>
                    {anio}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              label="Ordenar por"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="fecha_descarga">Fecha de descarga</MenuItem>
              <MenuItem value="curso">Curso (A-Z)</MenuItem>
              <MenuItem value="descargas">Más descargados</MenuItem>
              <MenuItem value="rating">Mejor evaluados</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Lista de exámenes */}
        {examenesOrdenados.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 8, color: "#888" }}>
            <SchoolIcon sx={{ fontSize: 80, mb: 2, color: "#ccc" }} />
            <Typography variant="h5" sx={{ mb: 1 }}>
              No hay exámenes en tu historial
            </Typography>
            <Typography variant="body1">
              Los exámenes que descargues aparecerán aquí
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate("/alumno")}
            >
              Explorar Exámenes
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {examenesOrdenados.map((examen) => {
              const fechaDescarga = getFechaUltimaDescarga(examen.id);
              const contadorDescargas = getContadorDescargas(examen.id);
              const rating = userRatings[examen.id] || 0;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={examen.id}>
                  <Card 
                    sx={{ 
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "0.2s",
                      "&:hover": { 
                        transform: "translateY(-4px)",
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1565C0" }}>
                          {examen.curso}
                        </Typography>
                        <Badge badgeContent={contadorDescargas} color="primary">
                          <DownloadIcon color="action" />
                        </Badge>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                        <Chip label={examen.tipo} size="small" color="primary" variant="outlined" />
                        <Chip label={examen.ciclo} size="small" variant="outlined" />
                        <Chip label={`${examen.año}-${examen.periodo}`} size="small" variant="outlined" />
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          Última descarga: {formatearFecha(fechaDescarga)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <StarIcon fontSize="small" color="action" />
                        <Rating value={rating} readOnly size="small" />
                        <Typography variant="body2" color="textSecondary">
                          ({rating > 0 ? rating : 'Sin evaluar'})
                        </Typography>
                      </Box>
                    </CardContent>

                    <Divider />

                    <CardActions sx={{ p: 2, gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => window.open(examen.archivo_url, '_blank')}
                        sx={{ flex: 1 }}
                      >
                        Ver
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDescargar(examen)}
                        sx={{ flex: 1 }}
                      >
                        Descargar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}