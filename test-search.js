// Phase 4.3 테스트 스크립트
const fetch = require('node-fetch');

async function testSearchAPI() {
  console.log('🚀 Phase 4.3 Search API 테스트 시작...\n');

  const testData = {
    keywords: ["인공지능", "AI"],
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString()
    },
    sources: [],
    category: "technology",
    sortBy: "relevance",
    limit: 5,
    async: false // 동기 모드로 테스트
  };

  try {
    console.log('📤 검색 요청 데이터:', JSON.stringify(testData, null, 2));
    console.log('\n⏳ 검색 API 호출 중...\n');

    const response = await fetch('http://localhost:3001/api/search/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ API 오류:', result);
      return false;
    }

    console.log('✅ API 응답 성공!');
    console.log('📊 검색 결과:', {
      searchId: result.data?.searchId,
      totalResults: result.data?.totalResults,
      searchTime: result.data?.searchTime,
      resultsCount: result.data?.results?.length || 0
    });

    if (result.data?.results && result.data.results.length > 0) {
      console.log('\n📰 첫 번째 기사 샘플:');
      const firstArticle = result.data.results[0];
      console.log({
        title: firstArticle.title?.substring(0, 100) + '...',
        url: firstArticle.url,
        relevanceScore: firstArticle.relevanceScore,
        searchRank: firstArticle.searchRank,
        keywordTags: firstArticle.keywordTags
      });
    }

    return true;

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    return false;
  }
}

async function testDatabaseData() {
  console.log('\n🗄️ 데이터베이스 확인 중...\n');

  try {
    // 검색 기록 조회
    const historyResponse = await fetch('http://localhost:3001/api/search/history');
    const historyResult = await historyResponse.json();

    console.log('📋 검색 기록:', {
      count: historyResult.data?.length || 0,
      recent: historyResult.data?.[0] ? {
        id: historyResult.data[0].id,
        searchQuery: historyResult.data[0].searchQuery,
        status: historyResult.data[0].status,
        resultCount: historyResult.data[0].resultCount
      } : 'No data'
    });

    return historyResult.data?.length > 0;

  } catch (error) {
    console.error('❌ 데이터베이스 확인 실패:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Phase 4.3 구현 테스트\n');
  console.log('=' .repeat(50));

  const apiTest = await testSearchAPI();

  if (apiTest) {
    console.log('\n' + '=' .repeat(50));
    await testDatabaseData();
  }

  console.log('\n' + '=' .repeat(50));
  console.log(apiTest ? '✅ 전체 테스트 성공!' : '❌ 테스트 실패');
}

runTests().catch(console.error);