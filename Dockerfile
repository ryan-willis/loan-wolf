FROM node:18-alpine as base
ENV NODE_ENV production
# for prisma
RUN apk add openssl && rm -rf /var/cache/apk/*

# development/build node_modules
FROM base as build
WORKDIR /myapp
ADD package*.json ./
RUN npm install --include=dev
ADD prisma .
RUN npx prisma generate
ADD . .
RUN npm run build:contained

# production/runtime node_modules
FROM base as production-deps
WORKDIR /myapp
COPY --from=build /myapp/node_modules /myapp/node_modules
ADD package*.json ./
RUN npm prune --omit=dev

# production image with minimal footprint
FROM base
WORKDIR /myapp
COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma
COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public
COPY --from=build /myapp/prisma /myapp/prisma
COPY --from=build /myapp/package.json /myapp/

EXPOSE 3000

RUN mkdir -p /data/loan-wolf
VOLUME [ "/data/loan-wolf" ]
ENV DATABASE_URL file:/data/loan-wolf/sqlite3.db

# important: for now, migrates the database and seeds it if necessary
CMD ["npm", "run", "start:contained"]