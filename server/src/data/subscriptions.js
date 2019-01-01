import { parse } from 'graphql';
import { getArgumentValues } from 'graphql/execution/values';

export function getSubscriptionDetails(schema, params) {
  const parsedQuery = parse(params.query);
  let args = {};
  let name = '';

  parsedQuery.definitions.forEach((definition) => {
    if (definition.kind === 'OperationDefinition') {
      // doesn't support fragments for now:
      const rootField = definition.selectionSet.selections[0];
      name = rootField.name.value;

      const fields = schema.getSubscriptionType().getFields();
      args = getArgumentValues(fields[name], rootField, params.variables);
    }
  });

  return { args, name };
}
