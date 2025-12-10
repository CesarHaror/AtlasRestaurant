import api from '../api/client';
import {
  Warehouse,
  CreateWarehouseDto,
  InventoryLot,
  CreateLotDto,
  InventoryMovement,
  CreateMovementDto,
  InventoryAdjustment,
  CreateAdjustmentDto,
  WasteRecord,
  CreateWasteDto,
  StockInfo,
  WasteReportData,
} from '../types/inventory';

const API_URL = '/inventory';

// ==================== WAREHOUSES ====================

export const getWarehouses = async (branchId?: string): Promise<Warehouse[]> => {
  const params = branchId ? { branchId } : {};
  const response = await api.get(`${API_URL}/warehouses`, { params });
  return response.data;
};

export const getWarehouse = async (id: string): Promise<Warehouse> => {
  const response = await api.get(`${API_URL}/warehouses/${id}`);
  return response.data;
};

export const createWarehouse = async (data: CreateWarehouseDto): Promise<Warehouse> => {
  const response = await api.post(`${API_URL}/warehouses`, data);
  return response.data;
};

export const updateWarehouse = async (
  id: string,
  data: Partial<CreateWarehouseDto>
): Promise<Warehouse> => {
  const response = await api.patch(`${API_URL}/warehouses/${id}`, data);
  return response.data;
};

export const deleteWarehouse = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/warehouses/${id}`);
};

export const toggleWarehouseActive = async (id: string): Promise<Warehouse> => {
  // Backend defines this route as POST (not PATCH)
  const response = await api.post(`${API_URL}/warehouses/${id}/toggle-active`);
  return response.data;
};

// ==================== LOTS ====================

export const getLotsByProduct = async (
  productId: string,
  warehouseId?: string
): Promise<InventoryLot[]> => {
  const params = warehouseId ? { warehouseId } : {};
  const response = await api.get(`${API_URL}/lots/product/${productId}`, { params });
  return response.data;
};

export const getLot = async (id: string): Promise<InventoryLot> => {
  const response = await api.get(`${API_URL}/lots/${id}`);
  return response.data;
};

export const createLot = async (data: CreateLotDto): Promise<InventoryLot> => {
  const response = await api.post(`${API_URL}/lots`, data);
  return response.data;
};

// ==================== STOCK ====================

export const getCurrentStock = async (): Promise<StockInfo[]> => {
  const response = await api.get(`${API_URL}/stock/current`);
  return response.data;
};

export const getStockByProduct = async (
  productId: string,
  warehouseId?: string
): Promise<StockInfo[]> => {
  const params = warehouseId ? { warehouseId } : {};
  const response = await api.get(`${API_URL}/stock/product/${productId}`, { params });
  return response.data;
};

export const getStockByWarehouse = async (warehouseId: string): Promise<StockInfo[]> => {
  const response = await api.get(`${API_URL}/stock/warehouse/${warehouseId}`);
  return response.data;
};

export const getInventoryLotsByWarehouse = async (warehouseId: string): Promise<InventoryLot[]> => {
  const response = await api.get(`${API_URL}/lots/warehouse/${warehouseId}`);
  return response.data;
};

export const getExpiringProducts = async (
  days: number = 30,
  warehouseId?: string
): Promise<InventoryLot[]> => {
  const params: any = { days };
  if (warehouseId) params.warehouseId = warehouseId;
  const response = await api.get(`${API_URL}/expiring`, { params });
  return response.data;
};

// ==================== MOVEMENTS ====================

export const getMovementsByProduct = async (
  productId: string,
  startDate?: string,
  endDate?: string
): Promise<InventoryMovement[]> => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get(`${API_URL}/movements/product/${productId}`, { params });
  return response.data;
};

export const createMovement = async (data: CreateMovementDto): Promise<InventoryMovement> => {
  const response = await api.post(`${API_URL}/movements`, data);
  return response.data;
};

// ==================== ADJUSTMENTS ====================

export const getAdjustments = async (
  warehouseId?: string,
  status?: string
): Promise<InventoryAdjustment[]> => {
  const params: any = {};
  if (warehouseId) params.warehouseId = warehouseId;
  if (status) params.status = status;
  const response = await api.get(`${API_URL}/adjustments`, { params });
  return response.data;
};

export const getAdjustment = async (id: string): Promise<InventoryAdjustment> => {
  const response = await api.get(`${API_URL}/adjustments/${id}`);
  return response.data;
};

export const createAdjustment = async (
  data: CreateAdjustmentDto
): Promise<InventoryAdjustment> => {
  const response = await api.post(`${API_URL}/adjustments`, data);
  return response.data;
};

export const approveAdjustment = async (
  id: string,
  notes?: string
): Promise<InventoryAdjustment> => {
  const response = await api.post(`${API_URL}/adjustments/${id}/approve`, { notes });
  return response.data;
};

export const applyAdjustment = async (id: string): Promise<InventoryAdjustment> => {
  const response = await api.post(`${API_URL}/adjustments/${id}/apply`);
  return response.data;
};

// ==================== WASTE ====================

export const getWasteRecords = async (
  warehouseId?: string,
  startDate?: string,
  endDate?: string
): Promise<WasteRecord[]> => {
  const params: any = {};
  if (warehouseId) params.warehouseId = warehouseId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get(`${API_URL}/waste`, { params });
  return response.data;
};

export const getWasteRecord = async (id: string): Promise<WasteRecord> => {
  const response = await api.get(`${API_URL}/waste/${id}`);
  return response.data;
};

export const createWasteRecord = async (data: CreateWasteDto): Promise<WasteRecord> => {
  const response = await api.post(`${API_URL}/waste`, data);
  return response.data;
};

export const getWasteReport = async (
  startDate: string,
  endDate: string,
  warehouseId?: string
): Promise<WasteReportData> => {
  const params: any = { startDate, endDate };
  if (warehouseId) params.warehouseId = warehouseId;
  const response = await api.get(`${API_URL}/waste/report`, { params });
  return response.data;
};
