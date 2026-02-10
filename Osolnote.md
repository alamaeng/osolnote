
### 1. 프로젝트 개요

데이터 베이스에 있는 수학 문제를 학생이 보고 답을 작성해서 맞는지 틀린지 확인하고, 해설을 보여준다. 그런 다음 틀린 문제를 오답으로 처리하여 다음에 다시 볼 수 있도록 하고 틀린 문제 만을 pdf 로 출력할 수 있도록 한다. 

### 2. 기술적인 부분 

- 개발 환경 Background는 Next.js 사용
- 개발 환경 Frontend는 tailwind.css 사용
- 개발 환경 데이터 베이스는 Supabase 사용
- Supabase MCP 적극 사용
- 문제 입력은 Latex가 포함된 Md 화일(text)로 입력하고 렌더링은 katex.org 의 방법을 사용한다. 




### 3. Supabase 

Project name : Osolnote
Database password : chunsang88!!

Project URL :
    https://sqanxepqiotlathomout.supabase.co

Publishable API Key : 
    sb_publishable_XVAkJ4YKB9XvyKV2G3unIw_Zg-Vr242


### 4. 몇 가지 규칙들 
1. 로그인을 해서 문제를 풀도록 한다. id는 학생이름으로 하고, 비밀번호는 직접 입력하도록 한다. 
2. 문제의 정답은 단답형이고 세 자리 이하의 정수로 한다. 
3. 각각의 문제는 영역, 문제 본문, 출처, 정답, 배점, 해설, image1, image2를 포함한다. image1은 문제에 포함된 이미지이고, image2는 해설에 포함된 이미지이다. 
. 