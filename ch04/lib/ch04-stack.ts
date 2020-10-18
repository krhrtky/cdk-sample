import * as cdk from '@aws-cdk/core';
import {
  Instance, InstanceClass, InstanceSize,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  SubnetConfiguration,
  SubnetType,
  Vpc,
} from '@aws-cdk/aws-ec2';
import { CfnOutput } from "@aws-cdk/core";

export class Ch04Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC を定義 ->
    const subnetConfig: SubnetConfiguration = {
      name: 'public',
      subnetType: SubnetType.PUBLIC,
    };

    const vpc = new Vpc(this, 'MyFirstEc2Vpc', {
      maxAzs: 1,
      cidr: '10.10.0.0/23',
      subnetConfiguration: [
        subnetConfig,
      ],
      natGateways: 0,
    });
    // <- VPC を定義

    // SecurityGroup を定義 ->
    const securityGroup = new SecurityGroup(this, 'MyFirstEc2SecurityGroup', {
      vpc,
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
    // <- SecurityGroup を定義

    const keyName = this.node.tryGetContext('KEY_NAME');

    // EC2 Instance を定義 ->
    const host = new Instance(this, 'MyFirstEc2Instance', {
      instanceType: new InstanceType(`${InstanceClass.T2}.${InstanceSize.MICRO}`),
      machineImage: MachineImage.latestAmazonLinux(),
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      securityGroup,
      keyName,
    });
    // <- EC2 Instance を定義

    // 標準出力 ->
    new CfnOutput(this, "InstancePublicDnsName", {
      value: host.instancePublicDnsName,
    });

    new CfnOutput(this, "InstancePublicDnsIp", {
      value: host.instancePublicIp,
    });
    // <- 標準出力
  }
}
