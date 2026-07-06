export class InvalidTenantIdError extends Error {
  constructor(tenantId: string) {
    super(`tenantId inválido (se espera un CUID): ${JSON.stringify(tenantId)}`);
    this.name = 'InvalidTenantIdError';
  }
}

export class TenantContextMissingError extends Error {
  constructor() {
    super('No hay tenant en el contexto de la request (AsyncLocalStorage vacío)');
    this.name = 'TenantContextMissingError';
  }
}
