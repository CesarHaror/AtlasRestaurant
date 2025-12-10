import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: Partial<InventoryService>;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findByProduct: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
    };

    controller = new InventoryController(service as InventoryService);
  });

  it('should return all inventory items', async () => {
    const res = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(res).toEqual([]);
  });

  it('should return inventory by product', async () => {
    const res = await controller.findByProduct('1');
    expect(service.findByProduct).toHaveBeenCalledWith(1);
    expect(res).toEqual([]);
  });

  it('should return one inventory item', async () => {
    const res = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(res).toBeNull();
  });
});
