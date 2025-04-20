import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Fab,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newExamen, setNewExamen] = useState({
    curso: "",
    tipo: "",
    ciclo: "",
    archivo_url: "",
  });
  const [pdfPreview, setPdfPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(""); // Para buscar por curso
  const [filterTipo, setFilterTipo] = useState(""); // Para filtrar por tipo
  const [filterCiclo, setFilterCiclo] = useState(""); // Para filtrar por ciclo

  // Obtener los datos de la tabla "examenes"
  useEffect(() => {
    const fetchExamenes = async () => {
      const { data, error } = await supabase.from("examenes").select("*");
      if (error) {
        console.error("Error al obtener exámenes:", error.message);
      } else {
        setExamenes(data);
      }
      setLoading(false);
    };

    fetchExamenes();
  }, []);

  // Manejar cambios en el formulario
  const handleNewExamenChange = (e) => {
    const { name, value } = e.target;
    setNewExamen((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar carga de archivo PDF
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPdfPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSnackbarMessage("Por favor, selecciona un archivo PDF válido.");
      setSnackbarOpen(true);
    }
  };

  // Agregar o editar un examen
  const handleAddExamen = async () => {
    const { curso, tipo, ciclo, archivo_url } = newExamen;

    if (!curso || !tipo || !ciclo || (!selectedFile && !newExamen.id)) {
      setSnackbarMessage("Todos los campos son obligatorios.");
      setSnackbarOpen(true);
      return;
    }

    let newArchivoUrl = archivo_url;

    if (selectedFile) {
      const sanitizedFileName = selectedFile.name
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.]/g, "");

      // Si estamos editando, eliminar el archivo antiguo
      if (archivo_url) {
        const oldFilePath = archivo_url.split(
          "/storage/v1/object/public/examenes/"
        )[1];
        const { error: deleteError } = await supabase.storage
          .from("examenes")
          .remove([oldFilePath]);
        if (deleteError) {
          console.error(
            "Error al eliminar el archivo antiguo:",
            deleteError.message
          );
        }
      }

      // Subir el nuevo archivo
      const { data, error: uploadError } = await supabase.storage
        .from("examenes")
        .upload(`pdfs/${sanitizedFileName}`, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error al subir el archivo:", uploadError.message);
        setSnackbarMessage("Error al subir el archivo.");
        setSnackbarOpen(true);
        return;
      }

      newArchivoUrl = `https://klxnawelvudmfwzavakb.supabase.co/storage/v1/object/public/examenes/${data.path}`;
    }

    const examenData = { curso, tipo, ciclo, archivo_url: newArchivoUrl };

    if (newExamen.id) {
      // Editar examen existente
      const { error: updateError } = await supabase
        .from("examenes")
        .update(examenData)
        .eq("id", newExamen.id);

      if (updateError) {
        console.error("Error al actualizar el examen:", updateError.message);
        setSnackbarMessage("Error al actualizar el examen.");
        setSnackbarOpen(true);
        return;
      }
      setSnackbarMessage("Examen actualizado exitosamente.");
    } else {
      // Agregar nuevo examen
      const { error: insertError } = await supabase
        .from("examenes")
        .insert([examenData]);

      if (insertError) {
        console.error("Error al agregar el examen:", insertError.message);
        setSnackbarMessage("Error al agregar el examen.");
        setSnackbarOpen(true);
        return;
      }
      setSnackbarMessage("Examen agregado exitosamente.");
    }

    setDialogOpen(false);
    setNewExamen({ curso: "", tipo: "", ciclo: "", archivo_url: "" });
    setPdfPreview(null);
    setSelectedFile(null);

    // Recargar los exámenes
    const { data } = await supabase.from("examenes").select("*");
    setExamenes(data);
  };

  // Eliminar un examen
  const handleDeleteExamen = async (id, archivo_url) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este examen?"
    );
    if (!confirmDelete) return;

    // Eliminar el archivo del almacenamiento
    if (archivo_url) {
      const filePath = archivo_url.split(
        "/storage/v1/object/public/examenes/"
      )[1];
      const { error: deleteFileError } = await supabase.storage
        .from("examenes")
        .remove([filePath]);
      if (deleteFileError) {
        console.error(
          "Error al eliminar el archivo del almacenamiento:",
          deleteFileError.message
        );
        setSnackbarMessage("Error al eliminar el archivo del almacenamiento.");
        setSnackbarOpen(true);
        return;
      }
    }

    // Eliminar el examen de la base de datos
    const { error } = await supabase.from("examenes").delete().eq("id", id);
    if (error) {
      console.error("Error al eliminar el examen:", error.message);
      setSnackbarMessage("Error al eliminar el examen.");
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage("Examen eliminado exitosamente.");
      setSnackbarOpen(true);

      // Recargar los exámenes
      const { data } = await supabase.from("examenes").select("*");
      setExamenes(data);
    }
  };

  // Editar un examen
  const handleEditExamen = (examen) => {
    setNewExamen(examen);
    setPdfPreview(null); // Limpiar vista previa
    setSelectedFile(null); // Limpiar archivo seleccionado
    setDialogOpen(true);
  };

  // Cerrar sesión
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
    } else {
      navigate("/"); // Redirigir al login
    }
  };
  // Estado para el término de búsqueda

  // Filtrar los exámenes según el término de búsqueda
  const filteredExamenes = examenes.filter(
    (examen) =>
      examen.curso.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterTipo ? examen.tipo === filterTipo : true) &&
      (filterCiclo ? examen.ciclo === filterCiclo : true)
  );

  return (
    <Box
      sx={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: "#388E3C" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Exámenes - Admin
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Menú lateral */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Box
          sx={{
            width: 250,
            height: "100%",
            backgroundColor: "black",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              padding: 2,
              textAlign: "center",
              borderBottom: "1px solid gray",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "white" }}
            >
              ExamURP
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Box
            sx={{
              padding: 2,
              borderTop: "1px solid gray",
              textAlign: "center",
              "&:hover": {
                backgroundColor: "#333333",
                cursor: "pointer",
              },
            }}
            onClick={() => navigate("/")}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                color: "white",
                "&:hover": {
                  color: "#FF5252",
                },
              }}
            >
              Cerrar Sesión
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, padding: 3, overflow: "auto" }}>
        {/* Filtros */}
        <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
          <TextField
            label="Buscar por curso"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">Todos los tipos</MenuItem>
            <MenuItem value="Parcial">Parcial</MenuItem>
            <MenuItem value="Final">Final</MenuItem>
            <MenuItem value="Sustitutorio">Sustitutorio</MenuItem>
          </Select>
          <Select
            value={filterCiclo}
            onChange={(e) => setFilterCiclo(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">Todos los ciclos</MenuItem>
            <MenuItem value="6 ciclo">6 ciclo</MenuItem>
            <MenuItem value="7 ciclo">7 ciclo</MenuItem>
          </Select>
        </Box>

        {/* Tabla */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 4 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#4CAF50" }}>
                {["Curso", "Tipo", "Ciclo", "Acciones"].map((header) => (
                  <TableCell
                    key={header}
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredExamenes.length > 0 ? (
                filteredExamenes.map((examen) => (
                  <TableRow key={examen.id} hover>
                    <TableCell>{examen.curso}</TableCell>
                    <TableCell>{examen.tipo}</TableCell>
                    <TableCell>{examen.ciclo}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        href={examen.archivo_url}
                        target="_blank"
                        sx={{
                          textTransform: "uppercase",
                          fontWeight: "bold",
                          backgroundColor: "#1976d2",
                          "&:hover": {
                            backgroundColor: "#1565c0",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                          },
                        }}
                      >
                        Visualizar
                      </Button>
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditExamen(examen)}
                        sx={{
                          marginLeft: 1,
                          "&:hover": {
                            color: "#7b1fa2",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDeleteExamen(examen.id, examen.archivo_url)
                        }
                        sx={{
                          marginLeft: 1,
                          "&:hover": {
                            color: "#d32f2f",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay exámenes disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => setDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {newExamen.id ? "Editar Examen" : "Agregar Examen"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Curso"
              name="curso"
              value={newExamen.curso}
              onChange={handleNewExamenChange}
              fullWidth
              margin="dense"
            />
            <Select
              label="Tipo"
              name="tipo"
              value={newExamen.tipo}
              onChange={(e) =>
                setNewExamen((prev) => ({ ...prev, tipo: e.target.value }))
              }
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>
                Seleccione un tipo
              </MenuItem>
              <MenuItem value="Parcial">Parcial</MenuItem>
              <MenuItem value="Final">Final</MenuItem>
              <MenuItem value="Sustitutorio">Sustitutorio</MenuItem>
            </Select>

            <Select
              label="Ciclo"
              name="ciclo"
              value={newExamen.ciclo}
              onChange={(e) =>
                setNewExamen((prev) => ({ ...prev, ciclo: e.target.value }))
              }
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>
                Seleccione un ciclo
              </MenuItem>
              <MenuItem value="6 ciclo">6 ciclo</MenuItem>
              <MenuItem value="7 ciclo">7 ciclo</MenuItem>
            </Select>
            <Button variant="contained" component="label">
              Subir PDF
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </Button>
            {pdfPreview && (
              <iframe
                src={pdfPreview}
                title="Vista previa del PDF"
                style={{
                  width: "100%",
                  height: "300px",
                  border: "1px solid #ccc",
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAddExamen} variant="contained" color="primary">
            {newExamen.id ? "Guardar Cambios" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbarOpen(false);
          setSnackbarMessage("");
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            setSnackbarOpen(false);
            setSnackbarMessage("");
          }}
          severity={
            snackbarMessage.includes("exitosamente") ? "success" : "error"
          }
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
