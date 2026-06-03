using MongoDB.Driver;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using PatenteApp.Domain.Entities;

namespace PatenteApp.Infrastructure.Data.MongoDb;

public class MongoQuestionRepository : IQuestionRepository
{
    private readonly IMongoCollection<Question> _questions;

    public MongoQuestionRepository(IMongoDatabase database)
    {
        _questions = database.GetCollection<Question>("Questions");
    }

    public async Task<IEnumerable<Question>> GetRandomQuestionsAsync(int count = 30)
    {
        // Pipeline de agregación altamente optimizado en MongoDB para obtener muestras aleatorias
        var pipeline = new EmptyPipelineDefinition<Question>().Sample(count);
        return await _questions.Aggregate(pipeline).ToListAsync();
    }

    public async Task<IEnumerable<Question>> GetQuestionsByIdsAsync(IEnumerable<string> ids)
    {
        var filter = Builders<Question>.Filter.In(q => q.Id, ids);
        return await _questions.Find(filter).ToListAsync();
    }
}