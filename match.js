class InterestMatcher {
    // 💡 1. TF (단어 빈도수) 계산
    getTF(term, document) {
        if (document.length === 0) return 0;
        const count = document.filter(t => t === term).length;
        return count / document.length;
    }

    // 💡 2. IDF (역문서 빈도수) 계산: 희귀한 취향일수록 가중치 상승
    getIDF(term, allDocuments) {
        const docCountWithTerm = allDocuments.filter(doc => doc.includes(term)).length;
        return Math.log(allDocuments.length / (1 + docCountWithTerm)) + 1;
    }

    // 💡 3. 코사인 유사도(Cosine Similarity) 계산
    calculateCosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // 💡 메인 매칭 알고리즘 실행
    getMatchResults(myId, myInterests, otherUsers) {
        const flatMyInterests = myInterests.flat(Infinity).filter(Boolean);
        const filteredUsers = otherUsers.filter(user => String(user.id) !== String(myId));

        // 모든 유저의 취향을 문서화 (TF-IDF 사전 생성용)
        const allProfiles = filteredUsers.map(user => {
            const movie = Array.isArray(user.movie) ? user.movie : (user.movie ? [user.movie] : []);
            const music = Array.isArray(user.music) ? user.music : (user.music ? [user.music] : []);
            const hobby = Array.isArray(user.hobby) ? user.hobby : (user.hobby ? [user.hobby] : []);
            return [...movie, ...music, ...hobby].flat(Infinity).filter(Boolean);
        });
        allProfiles.push(flatMyInterests); // 내 취향도 사전에 포함

        // 전체 고유 키워드(벡터의 차원) 생성
        const allUniqueTags = Array.from(new Set(allProfiles.flat()));

        // 🚀 내 벡터(My Vector) 생성 (TF-IDF 가중치 적용)
        const myVector = allUniqueTags.map(tag => {
            const tf = this.getTF(tag, flatMyInterests);
            const idf = this.getIDF(tag, allProfiles);
            return tf * idf;
        });

        // 🚀 상대방들과의 유사도 계산
        const results = filteredUsers.map((user, index) => {
            const userInterests = allProfiles[index];
            
            // 상대방의 벡터 생성
            const userVector = allUniqueTags.map(tag => {
                const tf = this.getTF(tag, userInterests);
                const idf = this.getIDF(tag, allProfiles);
                return tf * idf;
            });

            // 코사인 유사도를 백분율(%)로 변환
            const similarity = this.calculateCosineSimilarity(myVector, userVector);
            const finalScore = isNaN(similarity) ? 0 : similarity;

            return {
                ...user,
                userId: user.id,
                nickname: user.nickname || '이름없음',
                interests: userInterests, // 프론트엔드가 화면에 그릴 해시태그 데이터
                matchScore: parseFloat((finalScore * 100).toFixed(1))
            };
        });

        // 💡 4. kNN(K-Nearest Neighbors) 원리 적용: 점수가 가장 높은 이웃 순으로 정렬
        return results.sort((a, b) => b.matchScore - a.matchScore);
    }
}

module.exports = new InterestMatcher();