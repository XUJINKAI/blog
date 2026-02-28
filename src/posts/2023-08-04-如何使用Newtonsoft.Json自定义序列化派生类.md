---
permalink: /posts/csharp-newtonsoft-json-custom-serialize-derived-class
title: 使用Newtonsoft.Json自定义序列化派生类
tags: C#
emotag: 
date: 2023-08-04 19:02:39 +08:00
last_modified_at:
---

使用Newtonsoft.Json序列化类时，可以通过设置`TypeNameHandling`参数来支持对派生类的反序列化。默认情况下，库会自动添加`$type`字段来记录类型名，这样反序列化时可以根据这个字段正确创建对应的子类。可惜的是，官方不支持对这个字段进行更多的自定义行为，所以我们要自己动手了。

代码很简单，如下所示。执行效果放在最后。

```csharp
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
public class JsonSubTypeConverter : JsonConverter
{
    public Type BaseType { get; }

    public IDictionary<string, Type>? SubTypeMap { get; }

    public string TypeIdentifier { get; }

    public JsonSubTypeConverter(Type baseType, IDictionary<string, Type>? typeMap = null, string typeIdentifier = "Type")
    {
        BaseType = baseType;
        SubTypeMap = typeMap;
        TypeIdentifier = typeIdentifier;

        SubTypeMap?.ToList().ForEach(pair =>
        {
            if (!baseType.IsAssignableFrom(pair.Value))
            {
                throw new ArgumentException($"Type {pair.Key}={pair.Value} is not assignable to {baseType}");
            }
        });
    }

    public Type GetTypeByName(string typeName)
    {
        if (SubTypeMap?.TryGetValue(typeName, out Type? type) ?? false)
            return type;
        type = Type.GetType(typeName);
        if (type == null || !BaseType.IsAssignableFrom(type))
        {
            throw new Exception($"Unknown type name {typeName}");
        }
        return type;
    }

    public string GetTypeName(Type type)
    {
        return SubTypeMap?.FirstOrDefault(x => x.Value == type).Key ?? type.FullName ?? type.Name;
    }

    public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
    {
        if (value == null)
        {
            writer.WriteNull();
            return;
        }
        var jObject = JObject.FromObject(value);
        var typeName = GetTypeName(value.GetType());
        jObject.AddFirst(new JProperty(TypeIdentifier, typeName));
        jObject.WriteTo(writer);
    }

    public override object? ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
    {
        if (reader.TokenType == JsonToken.Null)
        {
            return null;
        }
        var jObject = JObject.Load(reader);
        var typeName = jObject.GetValue(TypeIdentifier)?.Value<string>();
        if (typeName == null)
        {
            throw new JsonSerializationException($"Missing type identifier '{TypeIdentifier}'");
        }
        var type = GetTypeByName(typeName);
        var target = Activator.CreateInstance(type) ?? throw new Exception($"Failed to create instance of type {type}");
        serializer.Populate(jObject.CreateReader(), target);
        return target;
    }

    public override bool CanConvert(Type objectType)
    {
        return BaseType.IsAssignableFrom(objectType);
    }
}
```

测试代码如下：

```csharp
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
class Program
{
    public interface IAnimal { string Name { get; } }
    public class Cat : IAnimal { public string Name { get; set; } }
    public class Dog : IAnimal { public string Name { get; set; } }

    static void Main(string[] args)
    {
        var animals = new IAnimal?[] {
                new Cat { Name="狗·德川家康·薛定谔" },
                new Dog { Name="Doge" },
                null,
        };

        var converter = new JsonSubTypeConverter(
            typeof(IAnimal)
            , new Dictionary<string, Type> // Comment these line to use default type name
            {
               { "Miao~", typeof(Cat) },
               { "Wang!", typeof(Dog) },
            }
            //, typeIdentifier: "$type" // Comment this line to use default type identifier
        );

        var jsonSerializerSettings = new JsonSerializerSettings()
        {
            TypeNameHandling = TypeNameHandling.None,
            Formatting = Formatting.Indented,
            Converters = { converter }
        };

        var json1 = JsonConvert.SerializeObject(animals, jsonSerializerSettings);
        Console.WriteLine($"json1: {json1}");

        var obj = JsonConvert.DeserializeObject<IAnimal[]>(json1, jsonSerializerSettings);
        Console.WriteLine($"obj: {obj}, length={obj.Length}");
        foreach (var item in obj)
        {
            Console.WriteLine($"item: {item?.GetType().Name ?? "null"} {item?.Name}");
        }
    }
}
```

会生成如下的JSON：

```json
[
  {
    "Type": "Miao~",
    "Name": "狗·德川家康·薛定谔"
  },
  {
    "Type": "Wang!",
    "Name": "Doge"
  },
  null
]
```
