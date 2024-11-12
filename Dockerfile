# Use uma imagem base do Python
FROM python:3.11

# Crie um usuário não root
RUN useradd -m appuser

# Defina o diretório de trabalho no container
WORKDIR /app

# Copie apenas o requirements.txt e instale as dependências
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copie o restante do código
COPY . .

# Altere para o usuário não root
USER appuser

# Exponha a porta que a aplicação utiliza
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["python", "app.py"]
