# Use Node.js 22 (matching the project requirement)
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Accept build arguments for Vite environment variables
# These are needed at build time because Vite embeds them into the client bundle
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Make build args available as environment variables during build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Generate TypeScript types and build the application
RUN npm run typecheck
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reactrouter

# Copy built application
COPY --from=builder --chown=reactrouter:nodejs /app/build ./build
COPY --from=builder --chown=reactrouter:nodejs /app/package.json ./package.json
COPY --from=builder --chown=reactrouter:nodejs /app/node_modules ./node_modules

USER reactrouter

# Expose the port Railway will use
EXPOSE 3000

# Set the port environment variable
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
