import { schema as s } from "jazz-tools";

const schema = {
  organizations: s.table({
    name: s.string(),
  }),
  locations: s.table({
    name: s.string(),
    organizationId: s.ref("organizations"),
  }),
  members: s.table({
    name: s.string(),
    organizationId: s.ref("organizations"),
    user_id: s.string(),
    towerIds: s.array(s.ref("towers")).optional(),
    role: s.enum("towerleader", "guardleader", "admin"),
  }),
  protocols: s.table({
    name: s.string(),
    description: s.string().optional(),
    organizationId: s.ref("organizations"),
    schema: s.json(),
  }),
  submissions: s.table({
    protocolId: s.ref("protocols"),
    towerId: s.ref("towers"),
    organizationId: s.ref("organizations"),
    status: s.enum("open", "ongoing", "completed"),
    data: s.json(),
  }),
  towers: s.table({
    name: s.string(),
    number:s.int(),
    locationId: s.ref("locations"),
    organizationId: s.ref("organizations"),
    main: s.boolean(),
    status: s.enum(
      "lifeguard_on_duty",
      "use_caution_when_swimming",
      "beach_closed",
      "closed",
    ),
  }),
  towerdays: s.table({
    towerId: s.ref("towers"),
    date: s.timestamp(),
    organizationId: s.ref("organizations"),
    isCompleted: s.boolean(),
  }),
  guards: s.table({
    towerdayId: s.ref("towerdays"),
    organizationId: s.ref("organizations"),
    role: s.enum("guard", "guardleader", "towerleader"),
    name: s.string(),
  }),
  shifts: s.table({
    towerdayId: s.ref("towerdays"),
    organizationId: s.ref("organizations"),
    guardId: s.ref("guards"),
    start: s.timestamp(),
    end: s.timestamp(),
  }),
  todos: s.table({
    towerdayId: s.ref("towerdays"),
    organizationId: s.ref("organizations"),
    title: s.string(),
    commment: s.string().optional(),
    isCompleted: s.boolean(),
  }),
  incidents: s.table({
    towerdayId: s.ref("towerdays"),
    organizationId: s.ref("organizations"),
    description: s.string(),
    dateTime: s.timestamp(),
  }),
  weather: s.table({
    towerdayId: s.ref("towerdays"),
    organizationId: s.ref("organizations"),
    dateTime: s.timestamp(),
    airInCelsius: s.int().optional(),
    waterInCelsius: s.int().optional(),
    windInBft: s.int().optional(),
    windDirection: s.enum(
      "north",
      "east",
      "south",
      "west",
      "north-east",
      "north-west",
      "south-east",
      "south-west",
    ),
  }),
};

type AppSchema = s.Schema<typeof schema>;
export const app: s.App<AppSchema> = s.defineApp(schema);

export type Member = s.RowOf<typeof app.members>;
export type MemberQueryBuilder = typeof app.members;
export type Location = s.RowOf<typeof app.locations>;
export type LocationQueryBuilder = typeof app.locations;
export type Organization = s.RowOf<typeof app.organizations>;
export type OrganizationQueryBuilder = typeof app.organizations;
