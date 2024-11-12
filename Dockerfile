# Use uma imagem base do Python
FROM python:3.11

# Defina o diretório de trabalho no container
WORKDIR /

# Copie apenas o requirements.txt (ou o equivalente de dependências) e instale as dependências
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copie o restante do código
COPY . .

# Exponha a porta que a aplicação utiliza (substitua pela porta correta, se diferente)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["python", "app.py"]  # Ajuste para o comando que inicia sua aplicação
