
# 真实的需求
在前后端（广义上的前后端）分离的大势下，我们都基于接口进行开发。<br>
在故事拆分结束、阶段需求明确、接口拆分清楚后。为了提高开发效率，三种角色（前端开发、后端开发、测试）要并行工作。<br>
大家坐在一起（或找一个信得过的人）把接口定义（接口路径、入参、返回值）写入wiki。

## 开发
* 前端

    > 根据wiki中定义建立一个测试数据模型，找一个Mock工具或手动产生测试数据。<br>
      根据测试数据进行逻辑（页面逻辑、业务逻辑等）开发。<br>
      手动调整测试数据(边界值、状态值等)，不断自测，自测，自测（苦逼）。 
* 后端

    > 看着wiki开发入参模型（`Ctrl+C -> Ctrl+V`）、返回值模型（`Ctrl+C -> Ctrl+V`）、业务逻辑。<br>
      找个接口调用工具（postMan?）自测接口，改入参、调整逻辑，肉眼核对（对比wiki）返回结果。 
* 测试

    > 把接口测试用例写进Excel呢，还是写进xmind呢，还是只写功能测试用例呢？<br>
      这个问题好烦，妹子还是敷会面膜吧，天天对着电脑，太伤皮肤了。
      
## 接口变更
wiki ? 有人改，那是某个人改了。没人改，那是大家都很忙。改或不改都不影响前后端已开发完的接口。
      
## 联调
* 后端把接口部署到测试服务器上，或在本地起一个服务。
* 前端维护一个测试接口配置文件，调用测试接口。
* 调不通。为啥少传了一个参数？为啥参数类型不对？为啥调用方式（GET、POST）不对？为啥返回结果不对？....改程序，改程序，一直到调通。wiki ? 也许并没有修改。
* 测试呢？前后端都上测试环境后，我再测吧。

## 上线
* 前端维护一套线上接口配置文件，根据环境变量或手动切换到线上配置文件。

## 总结
* wiki作为一个文档管理工具很优秀，但是作为一个接口管理工具，能做的太少。
* 接口验证方式不统一，导致重复工作，且很难保证前后端的一致性。
* 测试人员在开发过程中介入的太少。

# 几个设想
* 有一个地方，可以方便前后端开发以及测试人员定义接口，谁都可以改，但是要知道是谁改的，改了什么。
* 接口定义可以产生支持前端开发的数据，可以校验前端调用的参数，也可以校验后端接口返回的数据格式。
* 接口定义支持多场景，即同一接口支持多套定义规则。
* 开发者可以选择是否对某个接口mock以及mock成什么样子，但是团队成员间不受影响。

# 关于架构
基于不重复造轮子的前提，找了一些可用的轮子。<br> 
接口管理有RAP可用，可二次开发的代理工具有anyproxy可用，接口mock有mockjs可用，但是缺乏一个整合性方案，要用起来配置工作还是比较繁重，对开发人员的学习成本比较高。 <br>
这时候就需要一个工具，整合现有工具，她就是anymock。
