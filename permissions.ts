import { schema as s } from "jazz-tools";
import { app } from "./schema.js";

export default s.definePermissions(app, ({ policy }) => {
  policy.organizations.allowRead.always();
  policy.organizations.allowInsert.always();
  policy.organizations.allowUpdate.always();
  policy.organizations.allowDelete.always();

  policy.locations.allowRead.always();
  policy.locations.allowInsert.always();
  policy.locations.allowUpdate.always();
  policy.locations.allowDelete.always();

  policy.members.allowRead.always();
  policy.members.allowInsert.always();
  policy.members.allowUpdate.always();
  policy.members.allowDelete.always();

  policy.protocols.allowRead.always();
  policy.protocols.allowInsert.always();
  policy.protocols.allowUpdate.always();
  policy.protocols.allowDelete.always();

  policy.submissions.allowRead.always();
  policy.submissions.allowInsert.always();
  policy.submissions.allowUpdate.always();
  policy.submissions.allowDelete.always();

  policy.towers.allowRead.always();
  policy.towers.allowInsert.always();
  policy.towers.allowUpdate.always();
  policy.towers.allowDelete.always();

  policy.towerdays.allowRead.always();
  policy.towerdays.allowInsert.always();
  policy.towerdays.allowUpdate.always();
  policy.towerdays.allowDelete.always();

  policy.guards.allowRead.always();
  policy.guards.allowInsert.always();
  policy.guards.allowUpdate.always();
  policy.guards.allowDelete.always();

  policy.shifts.allowRead.always();
  policy.shifts.allowInsert.always();
  policy.shifts.allowUpdate.always();
  policy.shifts.allowDelete.always();

  policy.todos.allowRead.always();
  policy.todos.allowInsert.always();
  policy.todos.allowUpdate.always();
  policy.todos.allowDelete.always();

  policy.incidents.allowRead.always();
  policy.incidents.allowInsert.always();
  policy.incidents.allowUpdate.always();
  policy.incidents.allowDelete.always();

  policy.weather.allowRead.always();
  policy.weather.allowInsert.always();
  policy.weather.allowUpdate.always();
  policy.weather.allowDelete.always();
});