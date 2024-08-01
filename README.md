# perf-ethereum-web
Front-end for performance testing of private Ethereum

## Quick start (Local)
- back-end (multiAgent 폴더) : controller (10050 포트), testcase용 agent (10060 포트)
```
# nodejs 사전 설치 필요 (v12 버전 이상)
git clone https://github.com/shmin81/perf-ethereum-agent.git
cd perf-ethereum-agent
npm install 
# beck-end를 실행함
bash agent.run.sh
```
- front-end (test-gh-pages 폴더) : 웹페이지 (10010 포트)
```
# nodejs 사전 설치 필요 (v12 버전 이상)
git clone https://github.com/shmin81/perf-ethereum-web.git
cd perf-ethereum-web
npm install 
# front-end를 실행함
npm run start
# 인터넷 브라우저에서 http://localhost:10010/ 접속
```