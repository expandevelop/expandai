export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  ecosystemProfile?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type LinkedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export type OnboardingRecord = {
  id: string;
  actorType: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Operator = {
  id: string;
  userId?: string;
  legalName: string;
  tradeName: string;
  document?: string;
  email?: string | null;
  phone?: string | null;
  commissionModel?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  user?: LinkedUser | null;
  productCatalogs?: ProductCatalog[];
  onboardings?: OnboardingRecord[];
};

export type OperatorOnboardingPayload = {
  companyName: string;
  document: string;
  email: string;
  phone?: string;
  password: string;
};

export type Partner = {
  id: string;
  userId?: string;
  companyName: string;
  document?: string;
  partnerLevel?: string;
  score?: string | number | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  user?: LinkedUser | null;
  onboardings?: OnboardingRecord[];
};

export type PartnerOnboardingPayload = {
  companyName: string;
  document: string;
  email: string;
  contactName?: string;
  password: string;
};

export type Client = {
  id: string;
  companyName: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductCatalog = {
  id: string;
  operatorId?: string;
  name: string;
  description?: string | null;
  category?: string | null;
  commissionRule?: string | null;
  status: string;
  price?: string;
  createdAt?: string;
  updatedAt?: string;
  operator?:
    | (Pick<Operator, "id" | "legalName" | "tradeName" | "status"> & {
        document?: string | null;
        commissionModel?: string | null;
      })
    | null;
};

export type ProductCatalogMutationPayload = {
  operatorId: string;
  name: string;
  description?: string;
  category?: string;
  commissionRule?: string;
};

export type Opportunity = {
  id: string;
  title: string;
  description?: string | null;
  externalReference?: string | null;
  estimatedValue?: string | null;
  source?: string | null;
  closeExpectedAt?: string | null;
  stage: string;
  createdAt?: string;
  updatedAt?: string;
  operator?: Pick<Operator, "id" | "legalName" | "tradeName" | "status"> | null;
  partner?: Pick<Partner, "id" | "companyName" | "partnerLevel" | "status"> | null;
  client?: {
    id: string;
    companyName?: string;
    tradeName?: string;
    status?: string;
  } | null;
  productCatalog?: Pick<ProductCatalog, "id" | "name" | "category" | "status"> | null;
};

export type CommercialRule = {
  id: string;
  productCatalogId: string;
  operatorId: string;
  operatorPercentage: string;
  partnerPercentage: string;
  platformPercentage: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  operator?: Pick<Operator, "id" | "legalName" | "tradeName">;
  productCatalog?: Pick<ProductCatalog, "id" | "name" | "category" | "status">;
};

export type BillingSplitAllocation = {
  id: string;
  billingRecordId: string;
  recipientType: string;
  recipientId?: string | null;
  percentage: string;
  amount: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BillingRecord = {
  id: string;
  commercialRuleId?: string | null;
  operatorId?: string | null;
  partnerId?: string | null;
  clientId?: string | null;
  productCatalogId?: string | null;
  externalReference?: string | null;
  description?: string | null;
  grossAmount: string;
  netAmount?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  status: string;
  splitStatus: string;
  createdAt?: string;
  updatedAt?: string;
  operator?: Pick<Operator, "id" | "legalName" | "tradeName"> | null;
  partner?: Pick<Partner, "id" | "companyName" | "partnerLevel"> | null;
  client?: {
    id: string;
    companyName?: string;
    tradeName?: string;
    document?: string;
  } | null;
  productCatalog?: Pick<ProductCatalog, "id" | "name" | "category"> | null;
  commercialRule?: Pick<
    CommercialRule,
    "id" | "operatorPercentage" | "partnerPercentage" | "platformPercentage" | "notes"
  > | null;
  splitAllocations?: BillingSplitAllocation[];
};

export type Sale = {
  id: string;
  opportunityId?: string | null;
  operatorId?: string | null;
  partnerId?: string | null;
  clientId?: string | null;
  productCatalogId?: string | null;
  commercialRuleId?: string | null;
  billingRecordId?: string | null;
  externalReference?: string | null;
  title: string;
  description?: string | null;
  grossAmount: string;
  netAmount?: string | null;
  status: string;
  closedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  operator?: Pick<Operator, "id" | "legalName" | "tradeName" | "status"> | null;
  partner?: Pick<Partner, "id" | "companyName" | "partnerLevel" | "status"> | null;
  client?: {
    id: string;
    companyName?: string;
    tradeName?: string;
    status?: string;
  } | null;
  productCatalog?: Pick<ProductCatalog, "id" | "name" | "category" | "status"> | null;
  commercialRule?: Pick<
    CommercialRule,
    "id" | "operatorPercentage" | "partnerPercentage" | "platformPercentage"
  > | null;
  opportunity?: Pick<Opportunity, "id" | "title" | "stage"> | null;
  billingRecord?: Pick<BillingRecord, "id" | "status" | "splitStatus"> | null;
};

export type TransactionFormOption = {
  value: string;
  label: string;
  hint?: string;
};
