import { useEffect, useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message } from 'antd';
import cashRegistersService from '../services/cashRegisters';
import api from '../api/client';

type AnyObj = Record<string, any>;

export default function CashRegistersPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AnyObj[]>([]);
  const [branches, setBranches] = useState<AnyObj[]>([]);
  const [filterBranchId, setFilterBranchId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AnyObj | null>(null);
  const [form] = Form.useForm();

  const columns = useMemo(() => [
    { title: 'Código', dataIndex: 'code', key: 'code' },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Sucursal', dataIndex: 'branchName', key: 'branchName', render: (v: string) => v || '-' },
    { title: 'Estado', dataIndex: 'isActive', key: 'isActive', render: (v: boolean) => v ? <Tag color="green">Activa</Tag> : <Tag color="red">Inactiva</Tag> },
    {
      title: 'Acciones', key: 'actions', render: (_: any, record: AnyObj) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>Editar</Button>
          <Button size="small" danger onClick={() => onDeactivate(record)} disabled={!record.isActive}>Desactivar</Button>
        </Space>
      ),
    },
  ], []);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      setBranches(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      message.error('No se pudieron cargar sucursales');
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = filterBranchId ? { branchId: filterBranchId } : {};
      const data = await cashRegistersService.list(params);
      setItems(data);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Error al listar cajas';
      message.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBranchId]);

  const onEdit = (record: AnyObj) => {
    setEditing(record);
    setModalOpen(true);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      branchId: record.branchId,
    });
  };

  const onDeactivate = async (record: AnyObj) => {
    Modal.confirm({
      title: `Desactivar caja ${record.name}`,
      content: 'La caja no podrá abrir sesiones mientras esté inactiva.',
      okText: 'Desactivar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await cashRegistersService.deactivate(record.id);
          message.success('Caja desactivada');
          load();
        } catch (err: any) {
          console.error(err);
          const msg = err?.response?.data?.message || 'Error al desactivar';
          message.error(Array.isArray(msg) ? msg.join(', ') : msg);
        }
      },
    });
  };

  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await cashRegistersService.update(editing.id, values);
        message.success('Caja actualizada');
      } else {
        await cashRegistersService.create(values);
        message.success('Caja creada');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      load();
    } catch (err: any) {
      if (err?.errorFields) return;
      console.error(err);
      const msg = err?.response?.data?.message || 'Error al guardar';
      message.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <Space orientation="vertical" style={{ width: '100%' }}>
      <Space align="center" wrap>
        <Select
          allowClear
          placeholder="Filtrar por sucursal"
          style={{ minWidth: 240 }}
          value={filterBranchId as any}
          onChange={(val) => setFilterBranchId(val)}
          options={(Array.isArray(branches) ? branches : []).map((b) => ({ label: b.name, value: b.id }))}
        />
        <Button type="primary" onClick={onCreate}>Nueva Caja</Button>
        <Button onClick={load} loading={loading}>Refrescar</Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={columns as any}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'Editar Caja' : 'Nueva Caja'}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        onOk={handleSubmit}
        okText={editing ? 'Guardar' : 'Crear'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Código" rules={[{ required: true, message: 'Ingrese el código' }]}>
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="branchId" label="Sucursal" rules={[{ required: true, message: 'Seleccione la sucursal' }]}>
            <Select
              placeholder="Seleccione la sucursal"
              options={(Array.isArray(branches) ? branches : []).map((b) => ({ label: b.name, value: b.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
