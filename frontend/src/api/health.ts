import { apiClient } from './client';

export type ApiHealth = {
    ok: boolean;
    timingPersistence?: boolean;
    version?: string;
};

export async function fetchApiHealth(): Promise<ApiHealth> {
    const { data } = await apiClient.get<ApiHealth>('/health');
    return data;
}
