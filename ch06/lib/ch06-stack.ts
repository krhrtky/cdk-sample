import {CfnOutput, Construct, RemovalPolicy, Stack, StackProps} from "@aws-cdk/core";
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { Vpc } from "@aws-cdk/aws-ec2";
import { Cluster, ContainerImage, FargateTaskDefinition } from "@aws-cdk/aws-ecs";
import { Effect, PolicyStatement } from "@aws-cdk/aws-iam";
import * as ssm from "@aws-cdk/aws-ssm";

const InstanceID = (name: string) => `EcsClusterQaBot-${name}`;

export class Ch06Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB の定義 ->
    const table = new Table(this, InstanceID("Table"), {
      partitionKey: {
        name: "item_id",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    // <- DynamoDB の定義

    const vpc = new Vpc(this, InstanceID("Vpc"), {
      maxAzs: 1
    });

    const cluster = new Cluster(this, InstanceID("Cluster"), {
      vpc,
    });

    const taskDef = new FargateTaskDefinition(this, InstanceID("TaskDef"), {
      cpu: 1024,
      memoryLimitMiB: 4096,
    });

    // Grant permissions ->
    table.grantReadWriteData(taskDef.taskRole);
    taskDef.addToTaskRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: ["ssm:GetParameter"],
      })
    );
    // <- Grant permissions

    const container = taskDef.addContainer(
      InstanceID("Container"),
      {
        image: ContainerImage.fromRegistry("registry.gitlab.com/tomomano/intro-aws/handson03:latest"),
      },
    );

    // Store parameters in SSM
    new ssm.StringParameter(
      this,
      "ECS_CLUSTER_NAME",
      {
        parameterName: "ECS_CLUSTER_NAME",
        stringValue: cluster.clusterName,
      },
    );
    new ssm.StringParameter(
      this,
      "ECS_TASK_DEFINITION_ARN",
      {
      parameterName: "ECS_TASK_DEFINITION_ARN",
        stringValue: taskDef.taskDefinitionArn,
      },
    );
    vpc.publicSubnets.forEach((publicSubnet, i) => {
      new ssm.StringParameter(
        this, `ECS_TASK_VPC_SUBNET_${i + 1}`,
        {
          parameterName: `ECS_TASK_VPC_SUBNET_${i + 1}`,
          stringValue: publicSubnet.subnetId,
        },
      );
    });
    new ssm.StringParameter(
      this, "CONTAINER_NAME",
      {
        parameterName: "CONTAINER_NAME",
        stringValue: container.containerName,
      }
    );
    new ssm.StringParameter(
      this, "TABLE_NAME",
      {
        parameterName: "TABLE_NAME",
        stringValue: table.tableName,
      }
    );

    new CfnOutput(this, "ClusterName", {
      value: cluster.clusterName,
    });
    new CfnOutput(this, "TaskDefinitionArn", {
      value: taskDef.taskDefinitionArn,
    });
  }
}
