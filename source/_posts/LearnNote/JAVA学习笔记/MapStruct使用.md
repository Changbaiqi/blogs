---
title: MapStruct使用
date: 2025-02-15 21:39:20
author: 长白崎
categories:
  - "MapStruct"
  - "Java"
tags:
  - "MapStruct"
  - "Java"
---



# MapStruct使用

---

## 1 说明：

* 



## 2 导入MapStruct

```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.6.0.Beta1</version> 
</dependency>
```

还需要在 maven-compiler-plugin / *annotationProcessorPaths* 下添加配置。 *mapstruct-processor* 用于在 `build` 期间生成映射器具体实现代码。

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.0.Beta1</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>

```



## 3 使用尝试

### 3.1 先定义POJO

这里，我们定义两个Java类， `SimpleSource` 是源类，`SimpleDestination` 是要映射的目标类，他们具有相同的字段。

```java
public class SimpleSource {
    private String name;
    private String description;
    // getters and setters
}
 
public class SimpleDestination {
    private String name;
    private String description;
    // getters and setters
}

```

### 3.2 Mapper接口定义

在MapStruct中，我们将类型转换器称为 `mapper`，请不要和Mybatis中的mapper混淆。

下面，我们定义mapper接口。使用@Mapper注解，告诉MapStruct这是我们的映射器

```java
@Mapper
public interface SimpleSourceDestinationMapper {
    SimpleDestination sourceToDestination(SimpleSource source);
    SimpleSource destinationToSource(SimpleDestination destination);
}

```

注意，我们只需定义接口即可，MapStruct 会自定创建对应的实现类。

然后执行 *mvn clean install* 触发 MapStruct 插件自动生成代码，生成后的实现类在 `/target/generated-sources/annotations/` 目录下。

下面就是 MapStruct 为我们自动生成的：

```java
public class SimpleSourceDestinationMapperImpl
  implements SimpleSourceDestinationMapper {
    @Override
    public SimpleDestination sourceToDestination(SimpleSource source) {
        if ( source == null ) {
            return null;
        }
        SimpleDestination simpleDestination = new SimpleDestination();
        simpleDestination.setName( source.getName() );
        simpleDestination.setDescription( source.getDescription() );
        return simpleDestination;
    }
    @Override
    public SimpleSource destinationToSource(SimpleDestination destination){
        if ( destination == null ) {
            return null;
        }
        SimpleSource simpleSource = new SimpleSource();
        simpleSource.setName( destination.getName() );
        simpleSource.setDescription( destination.getDescription() );
        return simpleSource;
    }
}

```

### 3.3 测试用例

OK，完成配置和代码生成后，我们可以进行转换测试：

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:applicationContext.xml")
public class SimpleSourceDestinationMapperIntegrationTest {

    @Autowired
    SimpleSourceDestinationMapper simpleSourceDestinationMapper;

    @Test
    public void givenSourceToDestination_whenMaps_thenCorrect() {
        // 创建源对象并赋值
        SimpleSource simpleSource = new SimpleSource();
        simpleSource.setName("SourceName");
        simpleSource.setDescription("SourceDescription");

        // 拷贝
        SimpleDestination destination = simpleSourceDestinationMapper.sourceToDestination(simpleSource);
        
        // 比较值是否一样
        assertEquals(simpleSource.getName(), destination.getName());
        assertEquals(simpleSource.getDescription(), destination.getDescription());
    }

    @Test
    public void givenDestinationToSource_whenMaps_thenCorrect() {
        SimpleDestination destination = new SimpleDestination();
        destination.setName("DestinationName");
        destination.setDescription("DestinationDescription");

        SimpleSource source = simpleSourceDestinationMapper.destinationToSource(destination);

        assertEquals(destination.getName(), source.getName());
        assertEquals(destination.getDescription(), source.getDescription());
    }

}

```



## 4 Spring集成

完成POJO以mapper定义后，我们可以通过 *Mappers.getMapper(YourClass.class)* 获取 MapStruct Mapper实例。

另一种推荐方式是直接使用 Spring 的依赖注入功能。
**MapStruct 同时支持 Spring 和 CDI**

### *4.1. 修改 Mapper*

对于Spring 应用，修改@Mapper注解，设置componentModel属性值为spring，如果是 CDI，则将其值设置为 cdi。

```java
@Mapper(componentModel = "spring")
public interface SimpleSourceDestinationMapper
```

### 4.2. 注入 Spring 组件到 Mapper 中

反过来，我们需要在mapper中引用Spring容器中的组件该如何实现？ 这种情况下，我们需要改用抽象类而非接口了：

```java
@Mapper(componentModel = "spring")
public abstract class SimpleDestinationMapperUsingInjectedService
```

然后添加我们熟知的 *@Autowired* 注入依赖：

```java
@Mapper(componentModel = "spring")
public abstract class SimpleDestinationMapperUsingInjectedService {

    @Autowired
    protected SimpleService simpleService;

    @Mapping(target = "name", expression = "java(simpleService.enrichName(source.getName()))")
    public abstract SimpleDestination sourceToDestination(SimpleSource source);
}
```

**切记不要将注入的 bean 设置为private** ，因为 MapStruct 需要在生成的实现类中访问该对象



## *5 不同字段名映射*

上例中，我们定义的两个 Bean 具有相同的字段名称，MapStruct 能够自动完成映射。如果，字段不一样呢？

下面我们创建两个新的员工Bean —— *Employee* 和 *EmployeeDTO*.

### **5.1. 新 POJOs**

```java
public class EmployeeDTO {

    private int employeeId;
    private String employeeName;
    // getters and setters
}
复制
public class Employee {

    private int id;
    private String name;
    // getters and setters
}
```

### **5.2 Mapper 接口配置**

映射字段不同时，我们需要在 @Mapping 注解中指定目标字段名。

在 MapStruct 中，我们还可以使用"."表示法来定义 bean 的成员

```java
@Mapper
public interface EmployeeMapper {

    @Mapping(target = "employeeId", source = "entity.id")
    @Mapping(target = "employeeName", source = "entity.name")
    EmployeeDTO employeeToEmployeeDTO(Employee entity);

    @Mapping(target = "id", source = "dto.employeeId")
    @Mapping(target = "name", source = "dto.employeeName")
    Employee employeeDTOtoEmployee(EmployeeDTO dto);
}
```

### **5.3 测试用例**

下面进行测试

```java
@Test
public void givenEmployeeDTOwithDiffNametoEmployee_whenMaps_thenCorrect() {
    EmployeeDTO dto = new EmployeeDTO();
    dto.setEmployeeId(1);
    dto.setEmployeeName("John");

    Employee entity = mapper.employeeDTOtoEmployee(dto);

    assertEquals(dto.getEmployeeId(), entity.getId());
    assertEquals(dto.getEmployeeName(), entity.getName());
}
```

更多测试用例可以去 [GitHub](https://github.com/eugenp/tutorials/tree/master/mapstruct) 上查看源码。

## **6. 子对象映射**

POJO 通常中不会只包含基本数据类型，其中往往会包含其它类。下面演示如何映射具有子对象引用的 bean。

### **6.1. 修改 POJO**

向 *Employee* 中新增一个子对象引用

```java
public class EmployeeDTO {
    private int employeeId;
    private String employeeName;
    private DivisionDTO division;
    // getters and setters omitted
}
复制
public class Employee {
    private int id;
    private String name;
    private Division division;
    // getters and setters omitted
}
复制
public class Division {
    private int id;
    private String name;
    // default constructor, getters and setters omitted
}
```

### **6.2 修改 Mapper**

这里我们需要为 *Division* 与 *DivisionDTO* 之间的转换添加方法。如果MapStruct检测到需要转换对象类型，并且要转换的方法存在于同一个类中，它将自动使用它。

```java
DivisionDTO divisionToDivisionDTO(Division entity);

Division divisionDTOtoDivision(DivisionDTO dto);
```

### **6.3. 测试用例**

对上面的测试代码稍作修改：

```java
@Test
public void givenEmpDTONestedMappingToEmp_whenMaps_thenCorrect() {
    EmployeeDTO dto = new EmployeeDTO();
    dto.setDivision(new DivisionDTO(1, "Division1"));
    Employee entity = mapper.employeeDTOtoEmployee(dto);
    assertEquals(dto.getDivision().getId(), 
      entity.getDivision().getId());
    assertEquals(dto.getDivision().getName(), 
      entity.getDivision().getName());
}
复制
```

## **7 数据类型映射**

MapStruct还提供了一些开箱即用的隐式类型转换。本例中，我们希望将 String 类型的日期转换为 Date 对象。

有关隐式类型转换的更多详细信息，请查看[MapStruct 官方文档](https://mapstruct.org/documentation/stable/reference/html/)

### **7.1. 修改 Bean**

向 Employee 中新增一个startDt 字段

```java
public class Employee {
    // other fields
    private Date startDt;
    // getters and setters
}
复制
public class EmployeeDTO {
    // other fields
    private String employeeStartDt;
    // getters and setters
}
```

### **7.2 修改 Mapper**

修改mapper，设置@Mapping注解的 *dateFormat* 参数，为startDate指定日期转换格式

```java
@Mapping(target="employeeId", source = "entity.id")
@Mapping(target="employeeName", source = "entity.name")
@Mapping(target="employeeStartDt", source = "entity.startDt",
         dateFormat = "dd-MM-yyyy HH:mm:ss")
EmployeeDTO employeeToEmployeeDTO(Employee entity);

@Mapping(target="id", source="dto.employeeId")
@Mapping(target="name", source="dto.employeeName")
@Mapping(target="startDt", source="dto.employeeStartDt",
         dateFormat="dd-MM-yyyy HH:mm:ss")
Employee employeeDTOtoEmployee(EmployeeDTO dto);
```

### **7.3 测试用例**

对前面的测试代码稍作修改：

```java
private static final String DATE_FORMAT = "dd-MM-yyyy HH:mm:ss";

@Test
public void givenEmpStartDtMappingToEmpDTO_whenMaps_thenCorrect() throws ParseException {
    Employee entity = new Employee();
    entity.setStartDt(new Date());
    EmployeeDTO dto = mapper.employeeToEmployeeDTO(entity);
    SimpleDateFormat format = new SimpleDateFormat(DATE_FORMAT);
 
    assertEquals(format.parse(dto.getEmployeeStartDt()).toString(),
      entity.getStartDt().toString());
}
@Test
public void givenEmpDTOStartDtMappingToEmp_whenMaps_thenCorrect() throws ParseException {
    EmployeeDTO dto = new EmployeeDTO();
    dto.setEmployeeStartDt("01-04-2016 01:00:00");
    Employee entity = mapper.employeeDTOtoEmployee(dto);
    SimpleDateFormat format = new SimpleDateFormat(DATE_FORMAT);
 
    assertEquals(format.parse(dto.getEmployeeStartDt()).toString(),
      entity.getStartDt().toString());
}
```

## **8 使用抽象类自定义映射器**

一些特殊场景 @Mapping 无法满足时，我们需要定制化开发，同时希望保留MapStruct自动生成代码的能力。下面我们演示如何通过创建抽象类实现。

### **8.1 Bean 定义**

实体类定义：

```java
public class Transaction {
    private Long id;
    private String uuid = UUID.randomUUID().toString();
    private BigDecimal total;

    //standard getters
}
```

DTO类：

```java
public class TransactionDTO {

    private String uuid;
    private Long totalInCents;

    // standard getters and setters
}
```

这里棘手的地方在于将 `BigDecimal` 类型的total美元金额，转换为 `Long totalInCents` (以美分表示的总金额)，这部分我们将使用自定义方法实现。

### **8.2 Mapper 定义**

下面使用抽象类实现我们的需求：

```java
@Mapper
abstract class TransactionMapper {

    public TransactionDTO toTransactionDTO(Transaction transaction) {
        TransactionDTO transactionDTO = new TransactionDTO();
        transactionDTO.setUuid(transaction.getUuid());
        transactionDTO.setTotalInCents(transaction.getTotal()
          .multiply(new BigDecimal("100")).longValue());
        return transactionDTO;
    }

    public abstract List<TransactionDTO> toTransactionDTO(
      Collection<Transaction> transactions);
}
```

在这里，单个对象之间的转换将完全使用我们自定义的映射方法。

而 *Collection* 与 *List* 类型之间的转换，仍然交给 *MapStruct* 完成，我们只需定义接口。

### **8.3 生成结果**

和我们预期一样，MapStruct 自动生成了剩余的部分：

```java
@Generated
class TransactionMapperImpl extends TransactionMapper {

    @Override
    public List<TransactionDTO> toTransactionDTO(Collection<Transaction> transactions) {
        if ( transactions == null ) {
            return null;
        }

        List<TransactionDTO> list = new ArrayList<>();
        for ( Transaction transaction : transactions ) {
            list.add( toTransactionDTO( transaction ) );
        }

        return list;
    }
}
```

第12行，*MapStruct* 调用了我们自己实现的方法。







## 参考文献：

[MapStruct 快速指南 | Baeldung中文网](https://www.baeldung-cn.com/mapstruct)