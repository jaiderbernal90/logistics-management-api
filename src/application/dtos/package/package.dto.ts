export interface CreatePackageDto {
  weight: number;
  size: string;
  type_of_product: string;
  description: string;
  value: number;
}

export interface PackageDto {
  id: number;
  weight: number;
  size: string;
  type_of_product: string;
  description: string;
  value: number;
  shipment_id?: number;
}
