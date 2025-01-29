Sometimes you need to update the certificates.
in this case you need to map the directory contains certificates to /usr/local/share/ca-certificates in the container.
i.e.:
 - ./ca-certificates:/usr/local/share/ca-certificates


