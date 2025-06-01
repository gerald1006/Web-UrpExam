import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { supabase } from "../../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

export default function ExamSafeAgregar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newExamen, setNewExamen] = useState({
    curso: "",
    tipo: "",
    ciclo: "",
    archivo_url: "",
    año: "",
    periodo: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewExamen((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPdfPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Por favor, selecciona un archivo PDF válido.");
      setSelectedFile(null);
      setPdfPreview(null);
    }
  };

  const handleAddExamen = async () => {
    const { curso, tipo, ciclo, año, periodo } = newExamen;
    if (!curso || !tipo || !ciclo || !año || !periodo || !selectedFile) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    setUploading(true);

    const sanitizedFileName = `${curso}_${tipo}_${ciclo}_${año}_${periodo}_${Date.now()}.pdf`
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_.]/g, "");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("examenes")
      .upload(`pdfs/${sanitizedFileName}`, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      alert("Error al subir el archivo.");
      setUploading(false);
      return;
    }

    const archivo_url = `https://klxnawelvudmfwzavakb.supabase.co/storage/v1/object/public/examenes/${uploadData.path}`;

    const { error } = await supabase.from("examenes").insert([
      { ...newExamen, archivo_url },
    ]);
    setUploading(false);
    if (!error) {
      setNewExamen({
        curso: "",
        tipo: "",
        ciclo: "",
        archivo_url: "",
        año: "",
        periodo: "",
      });
      setSelectedFile(null);
      setPdfPreview(null);
      navigate("/admin");
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(to bottom, #f0f2f5, #d3d3d3)",
        boxSizing: "border-box",
        padding: 0,
      }}
    >
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#000000" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            Agregar Examen
          </Typography>
         
        </Toolbar>
      </AppBar>

      {/* Drawer Sidebar */}
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

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          alignItems: "flex-start",
          width: "100%",
          maxWidth: "1400px",
          margin: "40px auto 0 auto",
          px: { xs: 1, sm: 3, md: 6 },
          pb: 4,
          boxSizing: "border-box",
        }}
      >
        {/* Formulario */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 480,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 4,
            p: 4,
            minWidth: 320,
            marginRight: { md: 3, xs: 0 },
            marginBottom: { xs: 4, md: 0 },
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Agregar Examen
          </Typography>
          <TextField
            label="Curso"
            name="curso"
            value={newExamen.curso}
            onChange={handleAddChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              name="tipo"
              value={newExamen.tipo}
              label="Tipo"
              onChange={handleAddChange}
            >
              <MenuItem value="">Seleccione tipo</MenuItem>
              <MenuItem value="Parcial">Parcial</MenuItem>
              <MenuItem value="Final">Final</MenuItem>
              <MenuItem value="Sustitutorio">Sustitutorio</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Ciclo</InputLabel>
            <Select
              name="ciclo"
              value={newExamen.ciclo}
              label="Ciclo"
              onChange={handleAddChange}
            >
              <MenuItem value="">Seleccione ciclo</MenuItem>
              <MenuItem value="6 ciclo">6 ciclo</MenuItem>
              <MenuItem value="7 ciclo">7 ciclo</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Año"
            name="año"
            type="number"
            value={newExamen.año}
            onChange={handleAddChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Periodo</InputLabel>
            <Select
              name="periodo"
              value={newExamen.periodo}
              label="Periodo"
              onChange={handleAddChange}
            >
              <MenuItem value="I">I</MenuItem>
              <MenuItem value="II">II</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: "#4CAF50",
              color: "white",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#1a512e" },
              mb: 2,
              width: "100%",
            }}
            disabled={uploading}
          >
            {selectedFile ? selectedFile.name : "Subir PDF"}
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#4CAF50",
              color: "white",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#1a512e" },
              width: "100%",
            }}
            onClick={handleAddExamen}
            disabled={uploading}
          >
            {uploading ? "Guardando..." : "GUARDAR"}
          </Button>
        </Box>
        {/* Preview PDF */}
        <Box
          sx={{
            flex: 2,
            minWidth: 400,
            minHeight: 350,
            border: "2px solid #222",
            borderRadius: 2,
            bgcolor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "calc(100% - 520px)",
            mx: "auto",
          }}
        >
          {pdfPreview ? (
            <iframe
              src={pdfPreview}
              title="Vista previa del PDF"
              width="100%"
              height="400px"
              style={{ border: "none" }}
            />
          ) : (
            <Typography color="textSecondary">Preview del PDF</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
