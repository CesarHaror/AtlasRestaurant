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

export interface InventoryLot {
  id: string;
  productId: number;
  warehouseId: number;
  lotNumber: string;            // Número externo del proveedor
  internalLot?: string;         // Número interno generado (INT-yyMM-####)
  initialQuantity: number;      // Cantidad inicial declarada
  currentQuantity: number;      // Cantidad disponible actual
  reservedQuantity: number;     // Cantidad reservada (pendiente de salida)
  unitCost: number;             // Costo unitario
  totalCost: number;            // Costo total (unitCost * initialQuantity)
  entryDate: string;            // Fecha de entrada (generada servidor)
  productionDate?: string;      // Fecha de producción opcional
  expiryDate?: string;          // Fecha de vencimiento opcional
  status: LotStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: number;
    name: string;
  };
}

export interface InventoryMovement {
  id: string;
  movementType: MovementType;
  referenceType?: string;
  referenceId?: number;
  productId: number;
  warehouseId: number;
  lotId?: string;
  quantity: number;
  notes?: string;
  movementDate: string;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: number;
    name: string;
  };
  createdBy?: {
    id: string;
    username: string;
  };
}

export interface CreateLotDto {
  productId: number;
  warehouseId: number;
  lotNumber: string;
  initialQuantity: number;
  unitCost: number;
  productionDate?: string;
  expiryDate?: string;
  notes?: string;
}

export interface CreateMovementDto {
  productId: number;
  warehouseId: number;
  lotId?: string;
  quantity: number;
  movementType: MovementType;
  referenceType?: string;
  referenceId?: number;
  notes?: string;
}
