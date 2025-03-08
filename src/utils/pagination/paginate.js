export const paginate = async (model, query, page) => {
    const limit = 5
    const skip = limit * (page - 1);
    const data = await model.find(query).skip(skip).limit(limit);
    const totalItems = await model.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    return {
        data,
        totalItems,
        currentPage: Number(page),
        totalPages,
        itemsPerPage: data.length,
        nextPage: page < totalPages ? Number(page) + 1 : null,
        previousPage: page > 1 ? Number(page) - 1 : null,
    };
};