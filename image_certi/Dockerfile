FROM magiccpp1/librechat-dev-api:latest

RUN apk add ca-certificates
# Update certificates

# Copy the entry.sh script into the container
COPY entry.sh /entry.sh

# Make entry.sh executable
RUN chmod +x /entry.sh

# Set entry.sh as the entrypoint
ENTRYPOINT ["/entry.sh"]
CMD ["node", "server/index.js"]
