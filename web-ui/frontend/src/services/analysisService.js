import { httpClient } from './httpClient';

export const analysisService = {
    run(caseId) {
        return httpClient.post(`/analysis/run/${caseId}`, {});
    },
    getResult(caseId) {
        return httpClient.get(`/analysis/result/${caseId}`);
    },
    getHistoryInsight(caseId) {
        return httpClient.get(`/analysis/history-insight/${caseId}`);
    }
};
