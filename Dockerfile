# Use official Nginx image
FROM nginx:alpine

# Remove default nginx index.html
RUN rm -rf /usr/share/nginx/html/*

# Copy your static files into nginx's public directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Use the default Nginx command
CMD ["nginx", "-g", "daemon off;"]
