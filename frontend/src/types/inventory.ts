export enum WarehouseType {
  COLD_STORAGE = 'COLD_STORAGE',
  DRY_STORAGE = 'DRY_STORAGE',
  DISPLAY = 'DISPLAY',
  FREEZER = 'FREEZER',
}

export enum LotStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  SOLD_OUT = 'SOLD_OUT',
}

export enum MovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  WASTE = 'WASTE',
  INITIAL = 'INITIAL',
}

export enum AdjustmentStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  APPLIED = 'APPLIED',
  CANCELLED = 'CANCELLED',
}

export enum AdjustmentType {
  PHYSICAL_COUNT = 'PHYSICAL_COUNT',
  DAMAGE = 'DAMAGE',
  LOSS = 'LOSS',
  CORRECTION = 'CORRECTION',
}

export enum WasteType {
  EXPIRY = 'EXPIRY',
  DAMAGE = 'DAMAGE',
  THEFT = 'THEFT',
  TEMPERATURE = 'TEMPERATURE',
  QUALITY = 'QUALITY',
  OTHER = 'OTHER',
}

export interface MenuItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  category?: string;
}

export interface Warehouse {
  id: string;
  branchId: string;
  code: string;
  name: string;
  warehouseType: WarehouseType;
  hasTemperatureControl: boolean;
  targetTemperature?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface InventoryLot {
  id: string;
  productId: string;
  warehouseId: string;
  lotNumber: string;
  internalLot: string;
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  unitCost: number;
  totalCost: number;
  productionDate?: string;
  expiryDate?: string;
  entryDate: string;
  status: LotStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  product?: any;
  warehouse?: Warehouse;
}

export interface InventoryMovement {
  id: string;
  movementType: MovementType;
  referenceType?: string;
  referenceId?: string;
  productId: string;
  lotId?: string;
  warehouseId: string;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  userId: string;
  movementDate: string;
  notes?: string;
  createdAt: string;
  product?: any;
  lot?: InventoryLot;
  warehouse?: Warehouse;
  user?: any;
}

export interface AdjustmentItem {
  id: string;
  adjustmentId: string;
  productId: string;
  lotId: string;
  systemQuantity: number;
  physicalQuantity: number;
  difference: number;
  unitCost: number;
  costImpact: number;
  reason?: string;
  product?: any;
  lot?: InventoryLot;
}

export interface InventoryAdjustment {
  id: string;
  warehouseId: string;
  adjustmentNumber: string;
  type: AdjustmentType;
  status: AdjustmentStatus;
  createdBy: string;
  approvedBy?: string;
  appliedBy?: string;
  adjustmentDate: string;
  approvedAt?: string;
  appliedAt?: string;
  reason?: string;
  notes?: string;
  approvalNotes?: string;
  createdAt: string;
  updatedAt: string;
  warehouse?: Warehouse;
  creator?: any;
  approver?: any;
  applier?: any;
  items: AdjustmentItem[];
}

export interface WasteRecord {
  id: string;
  warehouseId: string;
  productId: string;
  lotId?: string;
  type: WasteType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reason: string;
  responsibleUserId?: string;
  wasteDate: string;
  photoUrl?: string;
  createdAt: string;
  warehouse: Warehouse;
  menuItem: MenuItem;
  lot?: InventoryLot;
  responsibleUser?: any;
}

export interface StockInfo {
  productId: string;
  warehouseId: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  averageCost: number;
  totalValue: number;
  lotCount: number;
  earliestExpiry: string | null;
  lots: InventoryLot[];
  menuItem: MenuItem;
  warehouse: Warehouse;
}

export interface CreateWarehouseDto {
  branchId: string;
  code: string;
  name: string;
  warehouseType: WarehouseType;
  hasTemperatureControl?: boolean;
  targetTemperature?: number;
  isActive?: boolean;
}

export interface CreateLotDto {
  productId: string;
  warehouseId: string;
  lotNumber: string;
  initialQuantity: number;
  unitCost: number;
  productionDate?: string;
  expiryDate?: string;
  notes?: string;
}

export interface CreateMovementDto {
  movementType: MovementType;
  referenceType?: string;
  referenceId?: string;
  productId: string;
  lotId?: string;
  warehouseId: string;
  quantity: number;
  unitCost?: number;
  notes?: string;
}

export interface CreateAdjustmentItemDto {
  lotId: string;
  systemQuantity: number;
  physicalQuantity: number;
}

export interface CreateAdjustmentDto {
  warehouseId: string;
  adjustmentDate: string;
  type: AdjustmentType;
  reason?: string;
  notes?: string;
  items: CreateAdjustmentItemDto[];
}

export interface CreateWasteDto {
  lotId: string;
  wasteDate: string;
  quantity: number;
  type: WasteType;
  reason: string;
  photoUrl?: string;
}

export interface WasteReportData {
  totalWaste: number;
  totalCost: number;
  byType: Array<{ type: string; quantity: number; cost: number }>;
  byProduct: Array<{ productId: string; productName: string; quantity: number; cost: number }>;
}
