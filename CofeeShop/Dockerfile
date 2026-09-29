# Copper Kettle Coffee — deploy anywhere Docker runs.
# Node 22, zero npm dependencies. The booking ledger lives in /app/data —
# mount a volume there (or attach a platform disk) to keep bookings across restarts.
FROM node:22-alpine
WORKDIR /app
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
