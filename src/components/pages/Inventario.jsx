import React, { useEffect, useState, useRef } from 'react'

import AddIcon from '@mui/icons-material/Add';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode, DataTable, Column, Tag } from 'primereact';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';

import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField
}
    from '@mui/material';
//import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

import { appointmentApi } from '../../services/appointmentApi';
import { formatearNumero } from '../../helpers/formato';
import './InventarioStyle.css';
import { textValidator } from '../../helpers/validator';
import { obtenerAdicion, obtenerGraduaciones } from '../../helpers/metricas';

export const Inventario = () => {
    let inventarioSeleccionado = '';
    const [openDialog, setOpenDialog] = useState(false);
    const [listInventario, setListInventario] = useState([]);
    const [selectedInventario, setSelectedInventario] = useState(null);
    const [listGraduaciones, setListGraduaciones] = useState([]);
    const [disabledGravado, setdisabledGravado] = useState(true);
    const [listAdicion, setListAdicion] = useState([]);
    const [formValues, setFormValues] = useState({
        descripcion: '',
        esfera: '',
        cilindro: '',
        adicion: '',
        linea: '',
        precioVenta: '',
        precioCompra: '',
        existencia: '',
        importe: '',
        valorGravado: '',
        categoria: '',
        proveedor: '',
        telefono: '',
        moda: '',
        material: '',
        diseno: '',
        color: '',
        estado: true,
        sucursales: localStorage.getItem('sucursalID')
        //fechaRegistro: new Date()
    });
    const lineas = [
        'Marca',
        'Delux',
        'Media',
        'Economica'
    ];

    const importe = [
        'Exento',
        'Gravado'
    ];
    const valorGravado = [
        '15%',
        '18%'
    ];

    useEffect(() => {
        if (window.innerWidth < 1900) {
            document.body.style.zoom = '80%'
        } else {
            document.body.style.zoom = '100%'
        }
        const sucursal = localStorage.getItem('sucursalID');
        appointmentApi.get(`inventario/bySucursal/${sucursal}`, '').then((response) => {
            setListInventario(response.data);
        })
        cleanForm();

        setListGraduaciones(obtenerGraduaciones());
        setListAdicion(obtenerAdicion());
    }, [])

    const cleanForm = () => {
        setFormValues({
            descripcion: '',
            esfera: '',
            cilindro: '',
            adicion: '',
            linea: '',
            precioVenta: '',
            precioCompra: '',
            existencia: '',
            categoria: '',
            proveedor: '',
            telefono: '',
            moda: '',
            diseno: '',
            color: '',
            sucursales: localStorage.getItem('sucursalID')
            //fechaRegistro: new Date()
        });
        setSelectedInventario(null);
        inventarioSeleccionado = '';

    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        cleanForm();
        setOpenDialog(false);
    };

    const toast = useRef(null);
    const toastForm = useRef(null);

    const createToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const createToastForm = (severity, summary, detail) => {
        toastForm.current.show({ severity: severity, summary: summary, detail: detail, life: 6000 });
    };

    const onCellSelect = (event) => {
        if (event.cellIndex === 0) {
            handleEdit();
        } else if (event.cellIndex === 1) {
            handleDelete();
        } else if (event.cellIndex === 2) {
            handleEnable();
        }
    };

    const handleChangeText = ({ target }, select) => {
        setFormValues({
            ...formValues,
            [select]: target.value
        })

        if (target.value === 'Exento') {
            setFormValues({
                ...formValues,
                valorGravado: '',
                [select]: target.value
            })
        }
    };

    const handleEdit = () => {
        handleOpenDialog();
    };

    const handleDelete = () => {
        confirmDialog({
            message: `¿Desea deshabilitar el registro? `,
            header: 'Deshabilitar',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: acceptDialogDisable,
            reject: rejectDialogDisable
        });
    };

    const acceptDialogDisable = () => {
        if (textValidator(inventarioSeleccionado)) {
            appointmentApi.put(`inventario/cambiarEstado/${inventarioSeleccionado}`, { estado: false })
                .then((response) => {
                    if (response.status === 200) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro a sido deshabilitado'
                        );

                        setListInventario(
                            listInventario.map(i =>
                                i._id === inventarioSeleccionado ? {
                                    ...i,
                                    estado: response.data.estado
                                } : i
                            )
                        );

                        console.log(response);
                        cleanForm();
                    } else {
                        createToast(
                            'error',
                            'Error',
                            response.statusText,
                        );
                        console.log(response.data);
                        cleanForm();
                        return;
                    }
                })
                .catch((err) => {
                    createToast(
                        'error',
                        'Error',
                        'Ha ocurrido un error al intentar deshabilitar el registro'
                    );
                    console.log(err);
                    handleCloseDialog();
                    cleanForm();
                });
        } else {
            createToast(
                'warn',
                'Acction requerida',
                'No se selecciono el inventario correctamente'
            );
        }
    }

    const rejectDialogDisable = () => {
        createToast(
            'warn',
            'Cancelado',
            'Acción cancelada'
        );
    }

    const handleEnable = () => {
        confirmDialog({
            message: `¿Desea habilitar el registro? `,
            header: 'Habilitar',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: acceptDialogEnable,
            reject: rejectDialogEnable
        });
    };

    const acceptDialogEnable = () => {
        if (textValidator(inventarioSeleccionado)) {
            appointmentApi.put(`inventario/cambiarEstado/${inventarioSeleccionado}`, { estado: true })
                .then((response) => {
                    if (response.status === 200) {
                        createToast(
                            'success',
                            'Confirmado',
                            'El registro a sido deshabilitado'
                        );
                        setListInventario(
                            listInventario.map(i =>
                                i._id === inventarioSeleccionado ? {
                                    ...i,
                                    estado: response.data.estado
                                } : i
                            )
                        );
                        console.log(response);
                        cleanForm();
                    } else {
                        createToast(
                            'error',
                            'Error',
                            response.statusText,
                        );
                        console.log(response.data);
                        cleanForm();
                        return;
                    }
                })
                .catch((err) => {
                    createToast(
                        'error',
                        'Error',
                        'Ha ocurrido un error al intentar habilitar el registro'
                    );
                    console.log(err);
                    handleCloseDialog();
                    cleanForm();
                });
        } else {
            createToast(
                'warn',
                'Acction requerida',
                'No se selecciono el inventario correctamente'
            );
        }
    }

    const rejectDialogEnable = () => {
        createToast(
            'warn',
            'Cancelado',
            'Acción cancelada'
        );
    }

    const renderEditButton = (data) => {
        if (data.estado === true) {
            return <EditIcon color='primary' fontSize='medium' />
        }
    };

    const renderChangeStatus = (data) => {
        if (data.estado === false) {
            return <DoneIcon color='success' fontSize='medium' />
        }
    };

    const renderDeleteButton = (data) => {
        if (data.estado !== false) {
            return <CancelIcon color='error' fontSize='medium' />
        }

    };

    const [filters] = useState({
        descripcion: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        esfera: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        cilindro: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        adicion: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        categoria: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        moda: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        proveedor: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
        linea: { value: '', matchMode: FilterMatchMode.STARTS_WITH }
    });

    const precioVentaBodyTemplate = ({ precioVenta }) => {
        return formatearNumero(precioVenta);
    };

    const precioCompraBodyTemplate = ({ precioCompra }) => {
        return formatearNumero(precioCompra);
    };

    const rowClass = (data) => {
        return {
            'bg-yellow-100': data.existencia <= 0,
            'bg-red-100': data.estado === false,
        }
    };

    const rendeEstado = (data) => {
        if (data.estado === true) {
            return <Tag severity="success" value="Activo"></Tag>
        } else {
            return <Tag severity="danger" value="Inactivo"></Tag>
        }
    }

    return (
        <>
            <h1>Informacion sobre Inventario </h1>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleOpenDialog}>Agregar inventario</Button>
            <br />
            <br />
            <Toast ref={toast} />
            <ConfirmDialog />

            <div style={{ width: '95%' }}>
                <DataTable value={listInventario}
                    showGridlines
                    stripedRows
                    size='small'
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    rowClassName={rowClass}
                    filters={filters}
                    filterDisplay='row'
                    selectionMode="single"
                    selection={setSelectedInventario}
                    cellSelection
                    onCellSelect={onCellSelect}
                    onSelectionChange={(e) => {
                        console.log(e);
                        const inventario = e.value.rowData;
                        setSelectedInventario(inventario._id);
                        inventarioSeleccionado = inventario._id;
                        setFormValues({
                            descripcion: inventario.descripcion,
                            esfera: inventario.esfera,
                            cilindro: inventario.cilindro,
                            adicion: inventario.adicion,
                            linea: inventario.linea,
                            precioVenta: inventario.precioVenta,
                            precioCompra: inventario.precioCompra,
                            existencia: inventario.existencia,
                            categoria: inventario.categoria,
                            proveedor: inventario.proveedor,
                            telefono: inventario.telefono,
                            moda: inventario.moda,
                            material: inventario.material,
                            importe: inventario.importe,
                            valorGravado: inventario.valorGravado,
                            diseno: inventario.diseno,
                            color: inventario.color,
                            sucursales: inventario.sucursales,
                            //fechaRegistro: new Date(inventario.fechaRegistro)
                        });
                        if (inventario.importe === 'Gravado') setdisabledGravado(false)
                        else setdisabledGravado(true)

                    }}
                    scrollable
                    columnResizeMode="expand"
                    resizableColumns                >
                    <Column body={renderEditButton}></Column>
                    <Column body={renderDeleteButton}></Column>
                    <Column body={renderChangeStatus}></Column>
                    <Column field="descripcion" header="Descripcion" sortable filter></Column>
                    <Column field="esfera" header="Esfera" filter style={{ minWidth: '9rem' }}></Column>
                    <Column field="cilindro" header="Cilindro" filter style={{ minWidth: '9rem' }}></Column>
                    <Column field="adicion" header="Adición" filter style={{ minWidth: '9rem' }}></Column>
                    <Column field="linea" header="Linea" filter style={{ minWidth: '9rem' }}></Column>
                    <Column field="existencia" header="Existencia" sortable ></Column>
                    <Column field="precioVenta" header="Precio Venta" sortable body={precioVentaBodyTemplate}></Column>
                    <Column field="precioCompra" header="Precio Compra" sortable body={precioCompraBodyTemplate}></Column>
                    <Column field="importe" header="Importe"></Column>
                    <Column field="valorGravado" header="Gravado"></Column>
                    <Column field="moda" header="Moda" filter style={{ minWidth: '9rem' }}></Column>
                    <Column field="material" header="Material"></Column>
                    <Column field="categoria" header="Categoria" filter style={{ minWidth: '9rem' }}></Column>
                    <Column field="color" header="Color"></Column>
                    <Column field="diseno" header="Diseño"></Column>
                    <Column field="proveedor" header="Proveedor" filter style={{ minWidth: '9rem' }}></Column>
                    <Column field="telefono" header="Telefono" ></Column>
                    <Column field="estado" header="Estado" body={rendeEstado}></Column>
                </DataTable>
            </div>
            <Dialog
                open={openDialog}
                disableEscapeKeyDown={true}
                maxWidth="md"
                fullWidth={true}
                onClose={handleCloseDialog}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        console.log(formValues);


                        if (textValidator(selectedInventario)) {
                            appointmentApi.put(`inventario/${selectedInventario}`, formValues)
                                .then((response) => {
                                    if (response.status === 202) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue editado correctamente'
                                        );
                                        handleCloseDialog();
                                        setListInventario(
                                            listInventario.map((i) =>
                                                i._id === selectedInventario ? { ...i, ...formValues } : i
                                            )
                                        );

                                        cleanForm();
                                    } else {
                                        createToast(
                                            'error',
                                            'Error',
                                            response.statusText,
                                        );
                                        console.log(response.data);
                                        cleanForm();
                                        return;
                                    }
                                })
                                .catch((err) => {
                                    createToast(
                                        'error',
                                        'Error',
                                        'Ha ocurrido un error'
                                    );
                                    console.log(err);
                                    handleCloseDialog();
                                    cleanForm();
                                });
                        } else {

                            appointmentApi.post('inventario', formValues)
                                .then((response) => {
                                    if (response.status === 201) {
                                        createToast(
                                            'success',
                                            'Confirmado',
                                            'El registro fue creado correctamente'
                                        );
                                        handleCloseDialog();
                                        setListInventario([...listInventario, response.data]);
                                        console.log(response);
                                        cleanForm();
                                    } else {
                                        createToast(
                                            'error',
                                            'Error',
                                            response.statusText,
                                        );
                                        console.log(response.data);
                                        cleanForm();
                                        return;
                                    }
                                })
                                .catch((err) => {
                                    createToast(
                                        'error',
                                        'Error',
                                        'Ha ocurrido un error'
                                    );
                                    console.log(err);
                                    handleCloseDialog();
                                    cleanForm();
                                });
                        }
                    },
                }}
            >
                <DialogTitle>Datos sobre inventario</DialogTitle>
                <DialogContent                 >
                    <DialogContentText>
                        Por favor rellene los campos sobre la informacion de su inventario
                    </DialogContentText>
                    <Toast ref={toastForm} />
                    <TextField
                        autoFocus
                        required
                        value={formValues.descripcion}
                        onChange={(event) => handleChangeText(event, 'descripcion')}
                        margin="dense"
                        id="descripcion"
                        name="descripcion"
                        label="Descripcion"
                        type="text"
                        sx={{ width: "70%" }}
                        variant="standard"
                        size="medium"
                    />
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                        <InputLabel id="linea">Linea</InputLabel>
                        <Select
                            labelId="linea"
                            id="linea"
                            value={formValues.linea}
                            onChange={(event) => handleChangeText(event, 'linea')}
                            label="linea"
                        >
                            {lineas.map(op => {
                                return (
                                    <MenuItem key={op} value={op}>{op}</MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <FormControl variant="standard" sx={{ m: 1, width: '50%' }}>
                            <InputLabel id="Esfera">Esfera</InputLabel>
                            <Select
                                labelId="Esfera"
                                id="Esfera"
                                value={formValues.esfera}
                                onChange={(event) => handleChangeText(event, 'esfera')}
                                label="Esfera"
                            >
                                {listGraduaciones.map(op => (
                                    <MenuItem key={op} value={op}>{op}</MenuItem>
                                )
                                )}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, width: '50%' }}>
                            <InputLabel id="cilindro">Cilindro</InputLabel>
                            <Select
                                labelId="cilindro"
                                id="cilindro"
                                value={formValues.cilindro}
                                onChange={(event) => handleChangeText(event, 'cilindro')}
                                label="Cilindro"
                            >
                                {listGraduaciones.map(op => (
                                    <MenuItem key={op} value={op}>{op}</MenuItem>
                                )
                                )}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, width: '50%' }}>
                            <InputLabel id="adicion">Adicion</InputLabel>
                            <Select
                                labelId="adicion"
                                id="adicion"
                                value={formValues.adicion}
                                onChange={(event) => handleChangeText(event, 'adicion')}
                                label="Adicion"
                            >
                                {listAdicion.map(op => (
                                    <MenuItem key={op} value={op}>{op}</MenuItem>
                                )
                                )}
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '15px'
                    }}>
                        <TextField
                            required
                            value={formValues.precioVenta}
                            onChange={(event) => {
                                if (event.target.value <= 0) {
                                    createToastForm(
                                        'error',
                                        'Error',
                                        'No se puede ingresar una cantidad negativa'
                                    );
                                    setFormValues({ ...formValues, precioVenta: 0 });
                                    return;
                                }
                                else {
                                    handleChangeText(event, 'precioVenta');
                                }
                            }} margin="dense"
                            id="precioVenta"
                            name="precioVenta"
                            label="Precio Venta"
                            type="number"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formValues.precioCompra}
                            onChange={(event) => {
                                if (event.target.value <= 0) {
                                    createToastForm(
                                        'error',
                                        'Error',
                                        'No se puede ingresar una cantidad negativa'
                                    );
                                    setFormValues({ ...formValues, precioCompra: 0 });
                                    return;
                                }
                                else {
                                    handleChangeText(event, 'precioCompra');
                                }
                            }}
                            margin="dense"
                            id="precioCompra"
                            name="precioCompra"
                            label="Precio Compra"
                            type="number"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formValues.existencia}
                            onChange={(event) => {
                                setFormValues({
                                    ...formValues,
                                    existencia: parseInt(event.target.value)
                                })
                            }}
                            margin="dense"
                            id="existencia"
                            name="existencia"
                            label="Existencia"
                            type="number"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="importe">Importe</InputLabel>
                            <Select
                                labelId="importe"
                                id="importe"
                                value={formValues.importe}
                                onChange={(event) => {
                                    setdisabledGravado(event.target.value === 'Exento' ? true : false);
                                    handleChangeText(event, 'importe')
                                }}
                                label="importe"
                            >
                                {importe.map(op => {
                                    return (
                                        <MenuItem key={op} value={op}>{op}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="valorGravado">Valor Gravado</InputLabel>
                            <Select
                                disabled={disabledGravado}
                                labelId="valorGravado"
                                id="valorGravado"
                                value={formValues.valorGravado}
                                onChange={(event) => handleChangeText(event, 'valorGravado')}
                                label="valorGravado"
                            >
                                {valorGravado.map(op => {
                                    return (
                                        <MenuItem key={op} value={op}>{op}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    <div className='container'>
                        <TextField
                            value={formValues.categoria}
                            onChange={(event) => handleChangeText(event, 'categoria')}
                            margin="dense"
                            id="categoria"
                            name="categoria"
                            label="Categoria"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            required
                            value={formValues.proveedor}
                            onChange={(event) => handleChangeText(event, 'proveedor')}
                            margin="dense"
                            id="proveedor"
                            name="proveedor"
                            label="Proveedor"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.telefono}
                            onChange={(event) => handleChangeText(event, 'telefono')}
                            margin="dense"
                            id="telefono"
                            name="telefono"
                            label="Telefono "
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.moda}
                            onChange={(event) => handleChangeText(event, 'moda')}
                            margin="dense"
                            id="moda"
                            name="moda"
                            label="Moda"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.material}
                            onChange={(event) => handleChangeText(event, 'material')}
                            margin="dense"
                            id="material"
                            name="material"
                            label="Material"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.diseno}
                            onChange={(event) => handleChangeText(event, 'diseno')}
                            margin="dense"
                            id="diseno"
                            name="diseno"
                            label="Diseño"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                        <TextField
                            value={formValues.color}
                            onChange={(event) => handleChangeText(event, 'color')}
                            margin="dense"
                            id="color"
                            name="color"
                            label="Color"
                            type="text"
                            fullWidth
                            variant="standard"
                            size="medium"
                        />
                    </div>
                    <br />
                    <br />
                    {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Ultima Cita *"
                            nombre="ultimaCita"
                            variant="standard"
                            value={formValues.ultimaCita}
                            format='YYYY-MM-DD'
                            onChange={(event) => {
                                setFormValues({
                                    ...formValues,
                                    ultimaCita: dayjs(event)
                                })
                            }}
                        />
                    </LocalizationProvider> */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} >Cancelar</Button>
                    <Button variant='contained' type="submit">Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
