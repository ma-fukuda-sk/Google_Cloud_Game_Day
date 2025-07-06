# Terraform インストール手順（Ubuntu / Debian）

## 1. 必要なパッケージをインストール

```bash
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl
```

## 2. HashiCorp の GPG 鍵を追加

```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | \
sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
```

## 3. HashiCorp のリポジトリを追加

```bash
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
sudo tee /etc/apt/sources.list.d/hashicorp.list
```

## 4. パッケージリストを更新し、Terraform をインストール

```bash
sudo apt update
sudo apt install terraform
```

## 🚀 成功確認

```bash
terraform -v
```

