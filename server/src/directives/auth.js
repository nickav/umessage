import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server-koa';

export default class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const key = field.resolve ? 'resolve' : 'subscribe';
    const next = field[key];

    field[key] = async function(root, args, ctx, info) {
      if (!ctx.user) {
        throw new AuthenticationError('Unauthorized');
      }

      return await next(root, args, ctx, info);
    };
  }
}
