import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { DeepPartial } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private repo: Repository<Restaurant>,
  ) {}

  async create(dto: CreateRestaurantDto): Promise<Restaurant> {
    const createData: DeepPartial<Restaurant> = { ...dto } as DeepPartial<Restaurant>;
    const restaurant = this.repo.create(createData);
    const saved = (await this.repo.save(restaurant)) as unknown as Restaurant;
    return saved;
  }

  async findAll(): Promise<Restaurant[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Restaurant> {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Restaurant not found');
    return r;
  }

  async update(id: number, dto: UpdateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    Object.assign(restaurant, dto);
    const saved = (await this.repo.save(restaurant)) as unknown as Restaurant;
    return saved;
  }

  async remove(id: number): Promise<void> {
    const restaurant = await this.findOne(id);
    await this.repo.remove(restaurant);
  }
}
