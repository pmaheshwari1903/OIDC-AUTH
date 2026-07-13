cert_file="cert"

mkdir -p "$cert_file"

openssl genpkey \
    -algorithm RSA \
    -out "$cert_file/private-key.pem" \
    -pkeyopt rsa_keygen_bits:2048 \

openssl rsa \
    -in "$cert_file/private-key.pem" \
    -pubout \
    -out "$cert_file/public-key.pem"

echo "Keys have been generated in the $cert_file/ folder"