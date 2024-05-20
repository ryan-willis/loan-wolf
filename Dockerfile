# base node image
FROM node:18-alpine as base
ENV NODE_ENV production
# Install openssl for Prisma
RUN apk add openssl

# Setup development/build node_modules
FROM base as build
WORKDIR /myapp
ADD package*.json ./
RUN npm install --include=dev
ADD prisma .
RUN npx prisma -v
RUN npx prisma generate
ADD . .
RUN npm run build

# Setup production/runtime node_modules
FROM base as production-deps
WORKDIR /myapp
COPY --from=build /myapp/node_modules /myapp/node_modules
ADD package*.json ./
RUN npm prune --omit=dev

# Finally, build the production image with minimal footprint
FROM base
WORKDIR /myapp
COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma
COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public
COPY --from=build /myapp/prisma/*.js /myapp/prisma/
ADD . .

EXPOSE 3000

RUN mkdir -p /data/loan-wolf
ENV DATABASE_URL file:/data/loan-wolf/sqlite3.db

CMD ["npm", "run", "start:contained"]