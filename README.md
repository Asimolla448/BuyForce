# תיאור הפרויקט 
BuyForce
זו פלטפורמת קניות קבוצתיות. הרעיון – קונים ביחד ומקבלים מחירים זולים במיוחד, בעיקר על דברים יקרים
כל אחד יכול להצטרף עם שקל בלבד לשם אימות אשראי
והחיוב המוזל קורה רק לאחר שמספר המשתתפים הגיע ליעד המשתתפים של המוצר לפני התאריך/זמן הסופי 
אם לא הגיעו ליעד המשתתפים לאחר שעבר התאריך/זמן הסופי הוא עושה החזר של שקל לכל המשתתפים.

המערכת מבוססת:
צד שרת - nest js , prisma , postgreSQL , redis , paypal
צד לקוח:
web - next js 
mobile - react native expo
והכול רץ ב-Docker בשביל redis

# הנחיות התקנה והרצה 
בתייקית
backend 
תיצור מסמך 
.env 
שיכיל:
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox
JWT_SECRET=
REDIS_HOST=127.0.0.1
REDIS_PORT=
PORT=

ברגע שהשלמת את החסר 
תפעיל את הטרמינל ותעקוב אחרי השלבים:
1. cd backend 
2. npm i 
3. npx prisma migrate dev -n init
4. npx prisma generate 
5. docker compose up --build  
6. npm run start:dev



תפתח עוד טרמינל דרך הפלוס בתוך הטרמינל בצד ימין למעלה 
יפתח לך עוד טרמינל ועקוב אחרי השלבים:
1. cd frontend
2. npm i 
3. npm run dev

וכדי להריץ את המובייל תעקוב אחרי השלבים האלו:
1. cd mobile 
2. npm i 
3. npx expo start

**במובייל ובאתר**
תיצור מסמך 
.env 
שיכיל:
NEXT_PUBLIC_PAYPAL_CLIENT_ID=

