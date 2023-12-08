using System;
using Azure;
using Azure.Data.Tables;
using NewtonsoftIgnore = Newtonsoft.Json.JsonIgnoreAttribute;
using JsonIgnore = System.Text.Json.Serialization.JsonIgnoreAttribute;

namespace Innovate.Models
{
    public abstract record EntityToDto : ITableEntity
    {
        [NewtonsoftIgnore] [JsonIgnore] public string PartitionKey { get; set; }
        [NewtonsoftIgnore] [JsonIgnore] public string RowKey { get; set; }
        [NewtonsoftIgnore] [JsonIgnore] public DateTimeOffset? Timestamp { get; set; }
        [NewtonsoftIgnore] [JsonIgnore] public ETag ETag { get; set; }

        public string Id
        {
            get => RowKey;
            set => RowKey = value;
        }
    }
}