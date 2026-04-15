# Stage 1: build
FROM node:24-alpine AS builder                                            
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate           
WORKDIR /app                                                              
                                                                            
COPY pnpm-workspace.yaml ./                                               
COPY pnpm-lock.yaml ./                                                    
COPY package.json ./                                                      
COPY packages/server/package.json ./packages/server/                      
RUN pnpm install --frozen-lockfile                               
                                          
COPY packages/server/tsconfig.json ./packages/server/
COPY packages/server/src ./packages/server/src                            
RUN pnpm --filter server exec tsc

# Stage 2: run
FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate           
WORKDIR /app
                                                                            
COPY pnpm-workspace.yaml ./                                      
COPY pnpm-lock.yaml ./
COPY package.json ./                        
COPY packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
                                                                            
COPY --from=builder /app/packages/server/dist ./packages/server/dist
                                                                            
WORKDIR /app/packages/server                                     
EXPOSE 3000                                                               
CMD ["node", "/app/packages/server/dist/server.js"]
