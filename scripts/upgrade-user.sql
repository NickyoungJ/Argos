-- Pro 티어로 업그레이드 (대문자 필수!)
UPDATE users 
SET tier = 'PRO' 
WHERE email = 'sjda6074@naver.com';

-- 결과 확인
SELECT id, email, tier, created_at 
FROM users 
WHERE email = 'sjda6074@naver.com';
