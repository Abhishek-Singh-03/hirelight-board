-- Clear test data (optional) and seed realistic community experiences
-- Run: mysql -u root -proot hirelight < seed_community.sql

-- Remove the placeholder "Hello testing" post
DELETE FROM experiences WHERE content = 'Hello testing ';

INSERT INTO experiences (job_title, company, content, type, upvotes, author_id, created_at) VALUES

('SDE 2', 'Groww', 
'Got the call from Groww recruiter after applying on LinkedIn. Timeline was super fast — 3 weeks total.

Round 1 (Online Assessment): 2 LeetCode Medium problems on Arrays and Hash Maps. 90 min window. Had to write clean, commented code.

Round 2 (Technical 1 — DSA): Sliding window + a real Groww backend problem around portfolio calculation. The interviewer was chill and gave hints when I was stuck.

Round 3 (Technical 2 — Low Level Design): Design a Notification Service. They wanted SOLID principles, not just a class diagram. I drew the pub-sub pattern and they loved it.

Round 4 (Managerial): Why fintech? Walk me through your biggest technical failure. I talked about a Redis caching bug I once caused in prod — total honesty worked.

Outcome: Offer! Base: 28 LPA + ESOPs. 

Tip: Groww cares a lot about ownership and moving fast. Show you can take full ownership, not just code.',
'offer', 89, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),

('Backend Engineer', 'Razorpay',
'Razorpay process was intense but very well-structured. Total timeline: 4 weeks from application to offer.

Screening: 30-minute call with HR. Standard questions about notice period and expectations.

Round 1 (HackerRank): 3 problems — easy, medium, hard. The hard one was a graph problem (shortest path variant). Solved 2.5 out of 3.

Round 2 (Tech Deep Dive): They asked me to walk through my most impactful project. I picked the payment retry system I built at my previous job. They went DEEP — failure modes, edge cases, DB transactions. Know your projects inside out.

Round 3 (System Design — 90 min): Design a payment gateway from scratch. They wanted to see idempotency handling, DB choice reasoning (why not MongoDB here), and retry logic. Concurrency was a key topic.

Round 4 (Bar Raiser): Cross-team interview. Focused on how I handle disagreement with tech leads and how I handle ambiguity. 

Salary: 32 LPA fixed + 3 LPA variable. Joining bonus of 2L.

Key Insight: Razorpay specifically values engineers who understand distributed systems failure modes. Study 2-phase commits and idempotency keys before your interview.',
'offer', 145, 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),

('Full Stack Developer', 'Postman',
'Applied via HireLight (yes, this very site 😄). Got a reply in 4 days.

Round 1 (Take-home): Build a mini REST client tool in 48 hours. No specific stack required. I used React + Node. They cared about code quality, not just functionality. Added retry logic and error handling which impressed them.

Round 2 (Code Review): They had my code on screen and asked me to explain every single decision. Why did I pick fetch over axios? Why did I structure the components this way? Super detailed. Be ready to defend your code choices.

Round 3 (Product Sense): As a developer, how would you improve Postman? I suggested better keyboard shortcuts for power users and a terminal-style view for CLI users. They were genuinely engaged.

Round 4 (Culture Fit with VP): Very conversational. What developer tools do you use daily and why? I talked about my dotfiles, Neovim config, and why I think developer experience is a product problem, not just a tooling problem.

Result: Offer! 26 LPA.

Biggest Tip: Postman hires developers who THINK like developers. Show that you have opinions about dev tools and care about DX deeply.',
'offer', 203, 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),

('SDE 1 (Fresher)', 'Freshworks',
'Just graduated from NIT Trichy. Zero internships. Got this offer purely through the hiring process.

Timeline: Campus drive → 6 weeks total.

Online Round: Aptitude + Coding. The coding had 2 problems — a string manipulation and a DP problem. Cleared both.

Technical Round 1: Basics of OOP, write code in C++/Java. I was asked to implement a LRU Cache from scratch. I used a LinkedHashMap initially but they pushed me to implement it with a doubly linked list + HashMap manually.

Technical Round 2: CS fundamentals — OS, DBMS, CN. They asked about process vs thread, what happens when you type a URL, and explain indexing in MySQL.

HR Round: Tell me about a time you led something in college. I talked about my college hackathon team. Very standard.

Offer: 9.5 LPA CTC (all-inclusive).

For freshers: Freshworks actually cares about CS fundamentals more than competitive programming. Study OS scheduling, DBMS normalization, and basic networking seriously. The DSA was medium-level, not LeetCode Hard.',
'offer', 67, 1, DATE_SUB(NOW(), INTERVAL 12 DAY)),

('Data Engineer', 'Coinbase',
'International company, fully remote role, applying from India. The process took 8 weeks total — longer than Indian companies but very structured.

Stage 1 (Recruiter Screen): 30 min. Timezone overlap questions, salary expectations in USD, and why Coinbase. Research their mission deeply.

Stage 2 (Technical Screen): 60 min coding. SQL queries + a Python data pipeline problem. They gave me messy JSON data and asked me to clean, transform, and load it. Clean code mattered more than speed.

Stage 3 (Virtual Onsite — 4 rounds in one day, 4 hours total):
- Data Modeling: Design a schema for tracking crypto transactions across wallets. Partitioning strategy was a key topic.
- SQL + Python: Live coding on complex aggregations.  
- System Design: Design a real-time price feed system for 100 currencies updating every second.
- Behavioral: STAR format. They focus heavily on "impact" — quantify everything.

Total Compensation: $95k base + $40k RSUs vesting over 4 years. 

Note: They use Greenhouse for their job postings (which is how HireLight found the role). The role was listed as remote-India-eligible.',
'offer', 312, 1, DATE_SUB(NOW(), INTERVAL 18 DAY)),

('DevOps Engineer', 'GitLab',
'GitLab is fully remote and async — and their interview process reflects that. Everything is documented, nothing is wasted.

Step 1: Applied → Got a Greenhouse link with a detailed job description that was better than anything I have seen.

Step 2 (Async Screening): They sent a questionnaire with 5 technical questions to answer in writing. No video call. This is the real first filter. Write well.

Step 3 (Technical Interview — Pairing): We pair-programmed fixing a broken Kubernetes deployment. They used a shared terminal. Know kubectl, Helm, and how pods communicate.

Step 4 (Team Interview): Met 4 engineers on the team. Very collaborative culture. They ask questions like "how would you improve our CI/CD pipeline" — they want your real opinions.

Step 5 (Values Interview): GitLab has 6 core values. They ask behavioral questions mapped directly to each value. Read their public handbook (it is actually public at handbook.gitlab.com) before this.

Offer: Very competitive — $110k equivalent + GitLab stock options.

Massive tip: Read the GitLab Handbook cover-to-cover. I am not joking. Their interviewers literally reference it. It shows you understand their culture better than any other candidate.',
'offer', 178, 1, DATE_SUB(NOW(), INTERVAL 22 DAY)),

('SDE 2 (Backend)', 'Meesho',
'Was rejected by Meesho in 2022. Applied again in 2024. Got the offer. Here is what changed.

2022 Failure: I could solve DSA problems but could not explain my decisions. System design was weak. I did not know about Meesho scale - they process 1M+ orders/day.

What I did in between: Read Designing Data-Intensive Applications (DDIA) cover to cover. Solved 150+ LeetCode problems focusing on understanding patterns. Contributed to open source to have real engineering stories.

2024 Process:
Round 1: DSA - Binary Search on answer + a Graph problem. Much more confident this time.
Round 2: System Design - Design flash sale system for Meesho sale events. Key: handling inventory locks, preventing overselling, Redis for cache, queue for order processing.
Round 3: HLD - How Meesho handles seller onboarding at scale. I discussed event-driven architecture, async processing, and retry queues.
Round 4: Behavioral - Focus on impact. "Tell me about a time you reduced latency in a system."

Offer: 24 LPA.

The best advice I can give: rejection is data. Treat it like a bug report about yourself. Find the root cause and fix it.',
'offer', 421, 1, DATE_SUB(NOW(), INTERVAL 30 DAY));
