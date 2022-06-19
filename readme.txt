วิธี deploy ใน google cloud platform
1.สร้าง docker image => docker build -t asia.gcr.io/cinecus-portfolio/api-name
2.push image ไปบน regisrty ของ gcr => docker push ชื่อ image
3.สร้าง config บน gcp
4.run