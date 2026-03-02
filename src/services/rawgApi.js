import axios from 'axios'

// API key dibaca dari .env (VITE_RAWG_API_KEY=xxx di file .env)
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY
const BASE_URL = 'https://api.rawg.io/api'

const rawgClient = axios.create({
    baseURL: BASE_URL,
    params: {
        key: RAWG_API_KEY,
    },
})

/**
 * Cari game berdasarkan keyword
 */
export const searchGames = async (query, page = 1, pageSize = 20) => {
    const response = await rawgClient.get('/games', {
        params: {
            search: query,
            page,
            page_size: pageSize,
            search_precise: false,
            ordering: '-rating',
        },
    })
    return response.data
}

/**
 * Ambil detail game berdasarkan ID
 */
export const getGameDetails = async (id) => {
    const response = await rawgClient.get(`/games/${id}`)
    return response.data
}

/**
 * Ambil list game populer / trending
 */
export const getPopularGames = async (page = 1, pageSize = 20) => {
    const response = await rawgClient.get('/games', {
        params: {
            page,
            page_size: pageSize,
            ordering: '-rating',
            metacritic: '80,100',
        },
    })
    return response.data
}

/**
 * Ambil game terbaru
 */
export const getNewReleases = async (pageSize = 10) => {
    const now = new Date()
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3))
    const from = threeMonthsAgo.toISOString().split('T')[0]
    const to = new Date().toISOString().split('T')[0]

    const response = await rawgClient.get('/games', {
        params: {
            page_size: pageSize,
            ordering: '-released',
            dates: `${from},${to}`,
        },
    })
    return response.data
}

/**
 * Ambil game berdasarkan genre
 */
export const getGamesByGenre = async (genreSlug, pageSize = 10) => {
    const response = await rawgClient.get('/games', {
        params: {
            genres: genreSlug,
            page_size: pageSize,
            ordering: '-rating',
        },
    })
    return response.data
}

export default rawgClient
