import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import Modal from "react-modal";
import "./App.css";
import swal from "sweetalert";

Modal.setAppElement("#root");

function App() {
  // Estados
  const [searchByPaymentMethod, setSearchByPaymentMethod] = useState("");

  const [ventas, setVentas] = useState([]);
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [nuevaVenta, setNuevaVenta] = useState({
    fecha_venta: "",
    metodo_pago: "",
    total_venta: 0,
    total_pedido: 0,
    nombre: "",
    telefono: "",
    documento: "",
    correo: "",
    productos: [],
  });

  const [selectedVenta, setSelectedVenta] = useState(null);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(""); // Nuevo estado para almacenar el producto seleccionado
  const initialProducts = [
    {
      _id: "1",
      nombre: "Vestido floral",
      precio: 35.99,
    },
    {
      _id: "2",
      nombre: "Camisa de lino",
      precio: 25.49,
    },
    {
      _id: "3",
      nombre: "Pantalón vaquero",
      precio: 29.99,
    },
    {
      _id: "4",
      nombre: "Blusa estampada",
      precio: 19.99,
    },
    {
      _id: "5",
      nombre: "Falda plisada",
      precio: 22.99,
    },
  ];

  // Efectos de lado

  useEffect(() => {
    axios
      .get("http://localhost:9000/api/ventas")
      .then((response) => {
        setVentas(response.data);
        setFilteredVentas(response.data); // Inicialmente, mostrar todas las ventas
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Funciones
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const filtered = ventas.filter((venta) =>
        venta.documento.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVentas(filtered);
    }
  };

  const handleProductSelect = (e) => {
    const selectedProductId = e.target.value;
    setSelectedProduct(selectedProductId);
  };

  const agregarProductoAVenta = (productoId) => {
    const productoExistente = initialProducts.find((p) => p._id === productoId);

    if (productoExistente) {
      const nuevaListaProductos = [...nuevaVenta.productos, productoExistente];
      setNuevaVenta((prevNuevaVenta) => ({
        ...prevNuevaVenta,
        productos: nuevaListaProductos,
      }));
    } else {
      console.error("Producto no encontrado");
    }
  };

  // Función para eliminar un producto de la lista de productos en la venta
  const eliminarProductoDeVenta = (productoId) => {
    const nuevaListaProductos = selectedVenta.productos.filter(
      (producto) => producto._id !== productoId
    );
    setSelectedVenta((prevSelectedVenta) => ({
      ...prevSelectedVenta,
      productos: nuevaListaProductos,
    }));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVentas.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaVenta((prevNuevaVenta) => ({
      ...prevNuevaVenta,
      [name]: value,
    }));
  };

  const handlePaymentMethodKeyPress = (e) => {
    if (e.key === "Enter") {
      const filtered = ventas.filter((venta) =>
        venta.metodo_pago.toLowerCase().includes(searchByPaymentMethod.toLowerCase())
      );
      setFilteredVentas(filtered);
    }
  };
  const crearVenta = (e) => {
    e.preventDefault();

    // Validar que todos los campos estén completos
    const camposRequeridos = [
      "fecha_venta",
      "metodo_pago",
      "nombre",
      "telefono",
      "documento",
      "correo",
      "productos",
    ];
    const camposVacios = camposRequeridos.filter((campo) => !nuevaVenta[campo]);

    if (camposVacios.length > 0) {
      swal("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    const selectedDate = new Date(nuevaVenta.fecha_venta);
    const currentDate = new Date();

    if (
      selectedDate.toISOString().slice(0, 10) !==
      currentDate.toISOString().slice(0, 10)
    ) {
      swal("Error", "Selecciona la fecha actual", "error");
      return;
    }

    const emailPattern = /^[^\s@]+@(gmail\.com|hotmail\.com)$/; // Expresión regular para Gmail o Hotmail
    if (!emailPattern.test(nuevaVenta.correo)) {
      swal("Error", "Ingrese un correo válido de Gmail o Hotmail", "error");
      return;
    }

    const numberFields = ["total_venta", "total_pedido", "telefono"];
    const invalidFields = [];

    numberFields.forEach((field) => {
      if (isNaN(parseFloat(nuevaVenta[field]))) {
        invalidFields.push(field);
      }
    });

    if (invalidFields.length > 0) {
      swal(
        "Error",
        `Los campos ${invalidFields.join(", ")} deben ser números`,
        "error"
      );
      return;
    }

    const totalVenta = nuevaVenta.productos.reduce(
      (total, producto) => total + producto.precio,
      0
    );
    const totalPedido = totalVenta;

    const formattedData = {
      fecha_venta: currentDate.toISOString(),
      metodo_pago: nuevaVenta.metodo_pago,
      total_venta: totalVenta,
      total_pedido: totalPedido,
      nombre: nuevaVenta.nombre,
      telefono: nuevaVenta.telefono,
      documento: nuevaVenta.documento,
      correo: nuevaVenta.correo,
      productos: nuevaVenta.productos, // Verifica que esta parte esté bien formada
    };

    axios
      .post("http://localhost:9000/api/ventas", formattedData)
      .then((response) => {
        setVentas([...ventas, response.data]);
        setNuevaVenta({
          fecha_venta: "",
          metodo_pago: "",
          total_venta: 0,
          total_pedido: 0,
          nombre: "",
          telefono: "",
          documento: "",
          correo: "",
          productos: [], // Limpiar la lista de productos después de enviar la venta
        });
        setModalIsOpen(false);
        swal(
          "¡Venta creada!",
          "La venta se ha creado exitosamente.",
          "success"
        );
      })
      .catch((error) => {
        console.error("Error creating venta:", error);
        swal("Error", "Hubo un error al crear la venta", "error");
      });
  };

  const editarVenta = (id, productosEditados) => {
    // Calcular el nuevo total de la venta
    const totalVenta = productosEditados.reduce(
      (total, producto) => total + producto.precio,
      0
    );

    swal({
      title: "¿Seguro que quieres editar la venta?",
      text: "Esta acción modificará la venta. ¿Estás seguro?",
      icon: "warning",
      buttons: ["Cancelar", "Sí, editar"],
      dangerMode: true,
    }).then((willEdit) => {
      if (willEdit) {
        axios
          .put(`http://localhost:9000/api/ventas/${id}`, {
            productos: productosEditados,
            total_venta: totalVenta, // Actualizar el total de la venta
            total_pedido: totalVenta, // Actualizar el total del pedido
          })
          .then((response) => {
            console.log("Productos de la venta editados:", response.data);
            // Aquí puedes manejar la respuesta después de editar los productos de la venta
            // Por ejemplo, actualizar el estado o realizar otra acción necesaria
          })
          .catch((error) => {
            console.error("Error al editar los productos de la venta:", error);
            // Aquí puedes manejar el error, mostrar un mensaje al usuario, etc.
            swal("Error", "Hubo un error al editar la venta", "error");
          });
      } else {
        // El usuario canceló la edición
        swal("Edición cancelada", "La venta no ha sido modificada", "info");
      }
    });
  };

  const eliminarVenta = (id) => {
    swal({
      title: "¿Estás seguro?",
      text: "Una vez eliminada, no podrás recuperar esta venta.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        axios
          .delete(`http://localhost:9000/api/ventas/${id}`)
          .then(() => {
            const updatedVentas = ventas.filter((venta) => venta._id !== id);
            setVentas(updatedVentas);
            const updatedFilteredVentas = filteredVentas.filter(
              (venta) => venta._id !== id
            );
            setFilteredVentas(updatedFilteredVentas);
            swal("¡La venta ha sido eliminada!", {
              icon: "success",
            });
          })
          .catch((error) => {
            console.error("Error deleting venta:", error);
            swal("Error", "Hubo un error al eliminar la venta", "error");
          });
      } else {
        swal("La venta no ha sido eliminada.");
      }
    });
  };

  const generarReportePDF = () => {
    if (Array.isArray(currentItems)) {
      const doc = new jsPDF();
      let y = 15;

      doc.text("Reporte de Ventas", 15, 10);

      currentItems.forEach((venta) => {
        doc.text(`Fecha de Venta: ${venta.fecha_venta}`, 15, y);
        doc.text(`Método de Pago: ${venta.metodo_pago}`, 15, y + 10);
        doc.text(`Total de Venta: ${venta.total_venta}`, 15, y + 20);
        doc.text(`Total de Pedido: ${venta.total_pedido}`, 15, y + 30);
        doc.text(`Nombre: ${venta.nombre}`, 15, y + 40);
        doc.text(`Teléfono: ${venta.telefono}`, 15, y + 50);
        doc.text(`Documento: ${venta.documento}`, 15, y + 60);
        doc.text(`Correo: ${venta.correo}`, 15, y + 70);
        y += 90;
        if (y >= 280) {
          doc.addPage();
          y = 15;
        }
      });

      doc.save("reporte_ventas.pdf");
    } else {
      console.error("currentItems no es un array:", currentItems);
    }
  };
  const openEditModal = (ventaId) => {
    const ventaSeleccionada = ventas.find((venta) => venta._id === ventaId);
    setSelectedVenta(ventaSeleccionada);
    setEditModalIsOpen(true);
  };

  return (
    <div>
      <h1>Ventas</h1>
      <input
        type="text"
        placeholder="Buscar por documento"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <input
        type="text"
        placeholder="Buscar por método de pago"
        value={searchByPaymentMethod}
        onChange={(e) => setSearchByPaymentMethod(e.target.value)}
        onKeyPress={(e) => handlePaymentMethodKeyPress(e)}
      />

      <button onClick={() => setModalIsOpen(true)}>Agregar Nueva Venta</button>

      <table>
        <thead>
          <tr>
            <th>Fecha de Venta</th>
            <th>Método de Pago</th>
            <th>Total de Venta</th>
            <th>Total de Pedido</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Documento</th>
            <th>Correo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((venta) => {
            const fechaVenta = new Date(venta.fecha_venta);
            const formattedDate = `${fechaVenta.getDate()}/${
              fechaVenta.getMonth() + 1
            }/${fechaVenta.getFullYear()}`;

            return (
              <tr key={venta._id}>
                <td>{formattedDate}</td>
                <td>{venta.metodo_pago}</td>
                <td>{venta.total_venta}</td>
                <td>{venta.total_pedido}</td>
                <td>{venta.nombre}</td>
                <td>{venta.telefono}</td>
                <td>{venta.documento}</td>
                <td>{venta.correo}</td>
                <td>
                  <button onClick={() => openEditModal(venta._id)}>
                    Editar
                  </button>
                  <button onClick={() => eliminarVenta(venta._id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from(
          { length: Math.ceil(filteredVentas.length / itemsPerPage) },
          (_, index) => (
            <button key={index + 1} onClick={() => paginate(index + 1)}>
              {index + 1}
            </button>
          )
        )}
      </div>

      <button onClick={generarReportePDF}>Generar Reporte PDF</button>

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>Agregar Nueva Venta</h2>
        <form onSubmit={crearVenta}>
          <input
            type="date"
            placeholder="Fecha de venta"
            name="fecha_venta"
            value={nuevaVenta.fecha_venta}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Método de pago"
            value={nuevaVenta.metodo_pago}
            onChange={(e) =>
              setNuevaVenta({ ...nuevaVenta, metodo_pago: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Nombre"
            value={nuevaVenta.nombre}
            onChange={(e) =>
              setNuevaVenta({ ...nuevaVenta, nombre: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={nuevaVenta.telefono}
            onChange={(e) =>
              setNuevaVenta({ ...nuevaVenta, telefono: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Documento"
            value={nuevaVenta.documento}
            onChange={(e) =>
              setNuevaVenta({ ...nuevaVenta, documento: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Correo"
            value={nuevaVenta.correo}
            onChange={(e) =>
              setNuevaVenta({ ...nuevaVenta, correo: e.target.value })
            }
          />

          {/* Sección para seleccionar y agregar productos */}
          <select value={selectedProduct} onChange={handleProductSelect}>
            <option value="">Selecciona un producto</option>
            {initialProducts.map((producto) => (
              <option key={producto._id} value={producto._id}>
                {producto.nombre} - ${producto.precio}
              </option>
            ))}
          </select>

          {/* Botón para agregar producto a la venta */}
          <button
            type="button"
            onClick={() => agregarProductoAVenta(selectedProduct)}
          >
            Agregar Producto
          </button>

          {/* Mostrar lista de productos agregados a la venta */}
          <ul>
            {nuevaVenta.productos &&
              nuevaVenta.productos.map((producto) => (
                <li key={producto._id}>
                  {producto.nombre} - ${producto.precio}
                  <button onClick={() => eliminarProductoDeVenta(producto._id)}>
                    Eliminar
                  </button>
                </li>
              ))}
          </ul>

          {/* Botón para crear la venta */}
          <button type="submit">Crear Venta</button>
        </form>
      </Modal>
      {/* Modal para editar la venta */}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={() => setEditModalIsOpen(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editarVenta(selectedVenta._id, selectedVenta.productos);
            setEditModalIsOpen(false);
          }}
        >
          <div className="modal-content">
            <span className="close" onClick={() => setEditModalIsOpen(false)}>
              &times;
            </span>
            <h2>Editar Productos de Venta</h2>
            <ul>
              {/* Aquí renderiza los detalles de la venta seleccionada */}
              {selectedVenta &&
                selectedVenta.productos.map((producto, index) => (
                  <li key={index}>
                    <input
                      type="text"
                      value={producto.nombre}
                      onChange={(e) => {
                        const newProducts = [...selectedVenta.productos];
                        newProducts[index].nombre = e.target.value;
                        setSelectedVenta({
                          ...selectedVenta,
                          productos: newProducts,
                        });
                      }}
                    />
                    <input
                      type="number"
                      value={producto.precio}
                      onChange={(e) => {
                        const newProducts = [...selectedVenta.productos];
                        newProducts[index].precio = parseFloat(e.target.value);
                        setSelectedVenta({
                          ...selectedVenta,
                          productos: newProducts,
                        });
                      }}
                    />
                    <button
                      onClick={() => {
                        const updatedProducts = selectedVenta.productos.filter(
                          (_, idx) => idx !== index
                        );
                        setSelectedVenta({
                          ...selectedVenta,
                          productos: updatedProducts,
                        });
                      }}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
            </ul>
            <select
              value=""
              onChange={(e) => {
                const productId = e.target.value;
                const selectedProduct = initialProducts.find(
                  (product) => product._id === productId
                );

                if (selectedProduct) {
                  setSelectedVenta({
                    ...selectedVenta,
                    productos: [
                      ...(selectedVenta.productos || []),
                      {
                        _id: selectedProduct._id,
                        nombre: selectedProduct.nombre,
                        precio: selectedProduct.precio,
                      },
                    ],
                  });
                }
              }}
            >
              <option value="" disabled>
                Selecciona un producto
              </option>
              {initialProducts.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.nombre} - ${product.precio}
                </option>
              ))}
            </select>

            <button type="submit">Guardar Cambios</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;
