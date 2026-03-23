const natural = require('natural');
const { CosineSimilarity } = require('ml-distance').similarity;

class InterestMatcher {
constructor() {
    this.tfidf = new natural.TfIdf();
}

getMatchResults(myInterests, otherUsers) {
    this.tfidf = new natural.TfIdf(); 
    const allProfiles = [...otherUsers, { id: 'me', interests: myInterests }];
    
allProfiles.forEach(user => {
    this.tfidf.addDocument(user.interests.join(' '));
});

const myVector = this.getVector(allProfiles.length - 1);

const results = otherUsers.map((user, index) => {
    const userVector = this.getVector(index);
    const similarity = CosineSimilarity(myVector, userVector);

    return {
        userId: user.id,
        nickname: user.nickname,
        matchScore: parseFloat((similarity * 100).toFixed(1))
        };
    });
ㄴ
    return results.sort((a, b) => b.matchScore - a.matchScore);
}

getVector(index) {
    const items = this.tfidf.listTerms(index);
    const vector = [];
    items.forEach(item => vector.push(item.tfidf));
    return vector.length > 0 ? vector : [0]; 
    }
}

module.exports = new InterestMatcher();