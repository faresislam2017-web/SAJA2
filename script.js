<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>חדר בריחה: בחירות ועד כיתה ה'</title>
    <!-- טעינת Vue.js מהרשת בשביל האינטראקטיביות -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <!-- טעינת פונט גוגל בעברית -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Secular+One&family=Assistant:wght@400;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary: #1e3a8a;
            --secondary: #3b82f6;
            --success: #10b981;
            --danger: #ef4444;
            --bg: #f3f4f6;
        }
        body {
            font-family: 'Assistant', sans-serif;
            background-color: var(--bg);
            margin: 0;
            padding: 20px;
            color: #1f2937;
        }
        h1, h2, h3 {
            font-family: 'Secular One', sans-serif;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid var(--primary);
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .timer {
            font-size: 2.5rem;
            font-family: 'Secular One', sans-serif;
            color: var(--danger);
            text-align: center;
            background: #ffe4e6;
            padding: 10px;
            border-radius: 10px;
            display: inline-block;
            margin: 10px auto;
            min-width: 150px;
        }
        .rooms-progress {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            background: #eee;
            padding: 10px;
            border-radius: 50px;
        }
        .room-badge {
            flex: 1;
            text-align: center;
            padding: 10px;
            border-radius: 50px;
            font-weight: bold;
            color: #9ca3af;
        }
        .room-badge.active {
            background: var(--secondary);
            color: white;
        }
        .room-badge.completed {
            background: var(--success);
            color: white;
        }
        .question-card {
            background: #f9fafb;
            border-right: 5px solid var(--secondary);
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        .input-field {
            width: 100%;
            padding: 10px;
            font-size: 1rem;
            border: 2px solid #cbd5e1;
            border-radius: 5px;
            margin-top: 8px;
            box-sizing: border-box;
        }
        .input-field:focus {
            border-color: var(--secondary);
            outline: none;
        }
        .btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 12px 25px;
            font-size: 1.1rem;
            border-radius: 5px;
            cursor: pointer;
            width: 100%;
            font-family: 'Secular One', sans-serif;
            transition: 0.2s;
        }
        .btn:hover {
            background: #172554;
        }
        .error-msg {
            color: var(--danger);
            font-weight: bold;
            margin-top: 10px;
            text-align: center;
        }
        .victory-screen {
            text-align: center;
            padding: 40px;
        }
        .victory-icon {
            font-size: 5rem;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
    </style>
</head>
<body>

<div id="app" class="container">
    <!-- מסך ניצחון -->
    <div v-if="gameCompleted" class="victory-screen">
        <div class="victory-icon">🎉🗳️🏆</div>
        <h2>כל הכבוד! הצלתם את הבחירות!</h2>
        <p>פתחתם את תיבת הקלפי המרכזית בזמן והצבעתם בצורה דמוקרטית והוגנת!</p>
        <button class="btn" @click="resetGame" style="background: var(--success);">לשחק מחדש</button>
    </div>

    <!-- מסך הפסד זמן -->
    <div v-else-if="timeOut" class="victory-screen" style="color: var(--danger);">
        <div class="victory-icon">⏰🛑</div>
        <h2>הזמן נגמר!</h2>
        <p>הקלפיות נסגרו לפני שהספקתם לפתוח את התיבה...</p>
        <button class="btn" @click="resetGame">נסו שוב</button>
    </div>

    <!-- משחק פעיל -->
    <div v-else>
        <div class="header">
            <h1>🔐 חדר בריחה דיגיטלי: בחירות כיתה ה'</h1>
            <p>ענו על 5 השאלות בכל חדר כדי לפתוח את המנעול ולעבור הלאה!</p>
            <div class="timer">{{ formatTime }}</div>
        </div>

        <!-- סרגל התקדמות בין החדרים -->
        <div class="rooms-progress">
            <div v-for="(room, index) in rooms" :key="index" 
                 class="room-badge" 
                 :class="{ active: currentRoomIndex === index, completed: currentRoomIndex > index }">
                {{ room.name }}
            </div>
        </div>

        <!-- כותרת החדר הנוכחי -->
        <h2>📍 {{ currentRoom.name }}</h2>
        <p style="font-style: italic; color: #666;">{{ currentRoom.description }}</p>

        <!-- רשימת 5 השאלות של החדר הנוכחי -->
        <div v-for="(q, i) in currentRoom.questions" :key="i" class="question-card">
            <p><strong>שאלה {{ (currentRoomIndex * 5) + i + 1 }}:</strong> {{ q.text }}</p>
            <input type="text" v-model="userAnswers[i]" class="input-field" placeholder="הקלידו את התשובה שלכם כאן...">
        </div>

        <!-- כפתור בדיקה ומעבר חדר -->
        <button class="btn" @click="checkRoomAnswers">🔓 פתח את מנעול החדר</button>
        <p v-if="errorMessage" class="error-msg">❌ {{ errorMessage }}</p>
    </div>
</div>

<script>
const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        // מבנה הנתונים של חדר הבריחה (20 שאלות ב-4 חדרים)
        const rooms = [
            {
                name: "חדר 1: מושגי יסוד",
                description: "הוכיחו שאתם מכירים את מושגי הדמוקרטיה הבסיסיים.",
                questions: [
                    { text: "מהו המושג שמתאר שלטון שבו כולם שווים ולעם יש כוח לבחור?", answer: "דמוקרטיה" },
                    { text: "כל כמה זמן נהוג לבחור ועד כיתה חדש?", answer: "שנה" },
                    { text: "מהי התכונה החשובה ביותר שצריכה להיות לנציג ועד (אחריות / עקשנות)?", answer: "אחריות" },
                    { text: "האם מותר להכריח חבר להצביע למועמד מסוים? (כן / לא)", answer: "לא" },
                    { text: "איך נקרא המסמך או דף הרעיונות שבו המועמד מציג את התוכניות שלו?", answer: "מצע" }
                ]
            },
            {
                name: "חדר 2: חשבון בחירות",
                description: "ועדת הקלפי צריכה עזרה בחישובים מתמטיים קריטיים! (הקלידו מספרים בלבד)",
                questions: [
                    { text: "בכיתה ה' יש 30 תלמידים. בדיוק חצי מהם הצביעו לרוני. כמה קולות היא קיבלה?", answer: "15" },
                    { text: "דני קיבל 12 קולות, ושירה קיבלו 8 קולות. בכמה קולות ניצח דני?", answer: "4" },
                    { text: "ביום הבחירות הגיעו רק 80% מהתלמידים. אם בכיתה יש 20 תלמידים, כמה באו?", answer: "16" },
                    { text: "ועדת הקלפי ספרה 25 פתקים, אך 3 נפסלו כי היו ריקים. כמה קולות כשרים נותרו?", answer: "22" },
                    { text: "כדי לזכות צריך לפחות רבע (1/4) מקולות הכיתה. אם בכיתה יש 32 תלמידים, כמה קולות צריך?", answer: "8" }
                ]
            },
            {
                name: "חדר 3: תעמולת בחירות",
                description: "קבעו לגבי כל סיטואציה אם היא חוקית או לא. (ענו: מותר / אסור)",
                questions: [
                    { text: "מועמד שמחלק סוכריות לכל מי שמבטיח להצביע לו.", answer: "אסור" },
                    { text: "מועמד שקורע שלט של מתחרה שלו כי הוא הסתיר לו את הלוח.", answer: "אסור" },
                    { text: "מועמדת שעוברת בהפסקה, מקשיבה לילדים ומסבירה איך היא תעזור להם.", answer: "מותר" },
                    { text: "פרסום שקרים בקבוצת הווטסאפ הכיתתית על מועמד אחר.", answer: "אסור" },
                    { text: "המשך תליית שלטים וצעקות במסדרונות בזמן שההצבעה כבר החלה.", answer: "אסור" }
                ]
            },
            {
                name: "חדר 4: יום הקלפי",
                description: "השלבים האחרונים של ספירת הקולות וההכרזה!",
                questions: [
                    { text: "כדי שאף אחד לא יראה מה הצבעתי, אני מכניס את הפתק לתוך...?", answer: "מעטפה" },
                    { text: "קבוצת התלמידים שמנהלת את יום הבחירות נקראת ועדת ה...?", answer: "קלפי" },
                    { text: "מה עושים אם שני מועמדים קיבלו בדיוק אותו מספר קולות? עושים סיבוב...?", answer: "שני" },
                    { text: "כמה פעמים מותר לכל תלמיד להצביע בקלפי?", answer: "אחת" },
                    { text: "אחרי שסופרים את כל הפתקים, מה הדבר הרשמי שמכריזים עליו לכולם?", answer: "תוצאות" }
                ]
            }
        ];

        const currentRoomIndex = ref(0);
        const userAnswers = ref(["", "", "", "", ""]);
        const errorMessage = ref("");
        const timeLeft = ref(2700); // 45 דקות בשניות (זמן שיעור)
        const gameCompleted = ref(false);
        const timeOut = ref(false);

        const currentRoom = computed(() => rooms[currentRoomIndex.value]);

        // פורמט של השעון (MM:SS)
        const formatTime = computed(() => {
            const minutes = Math.floor(timeLeft.value / 60);
            const seconds = timeLeft.value % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });

        // טיימר רץ
        onMounted(() => {
            setInterval(() => {
                if (timeLeft.value > 0 && !gameCompleted.value) {
                    timeLeft.value--;
                } else if (timeLeft.value === 0) {
                    timeOut.value = true;
                }
            }, 1000);
        });

        // בדיקת התשובות של החדר הנוכחי
        const checkRoomAnswers = () => {
            let allCorrect = true;
            
            for (let i = 0; i < currentRoom.value.questions.length; i++) {
                const cleanUserAns = userAnswers.value[i].trim().replace(/"/g, '');
                const cleanCorrectAns = currentRoom.value.questions[i].answer;
                
                // בדיקה בסיסית שמתעלמת מרווחים (מקל על הילדים בהקלדה)
                if (!cleanUserAns.includes(cleanCorrectAns) && cleanUserAns !== cleanCorrectAns) {
                    allCorrect = false;
                    break;
                }
            }

            if (allCorrect) {
                errorMessage.value = "";
                userAnswers.value = ["", "", "", "", ""]; // איפוס תיבות הטקסט לחדר הבא
                
                if (currentRoomIndex.value < rooms.length - 1) {
                    currentRoomIndex.value++;
                    alert("🔓 המנעול נפתח! עברתם לחדר הבא!");
                } else {
                    gameCompleted.value = true;
                }
            } else {
                errorMessage.value = "חלק מהתשובות אינן נכונות או שלא מולאו. נסו שוב בשיתוף פעולה עם חברי הקבוצה!";
            }
        };

        const resetGame = () => {
            currentRoomIndex.value = 0;
            userAnswers.value = ["", "", "", "", ""];
            errorMessage.value = "";
            timeLeft.value = 2700;
            gameCompleted.value = false;
            timeOut.value = false;
        };

        return {
            rooms,
            currentRoomIndex,
            currentRoom,
            userAnswers,
            errorMessage,
            formatTime,
            gameCompleted,
            timeOut,
            checkRoomAnswers,
            resetGame
        };
    }
}).mount('#app');
</script>

</body>
</html>
