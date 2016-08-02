var AWS = require('aws-sdk');


AWS.config = new AWS.Config({
	region: 'us-east-1'
});

var ec2 = new AWS.EC2();

var ec2_params = {
	ImageId: 'ami-fce3c696',
	MaxCount: 10,
	MinCount: 10,
	BlockDeviceMappings: [{
		DeviceName: "/dev/sda1",
		Ebs: {
			DeleteOnTermination: true ,
			VolumeSize: 8,
			VolumeType: 'gp2'
		}
	}],
	DisableApiTermination: false,
	DryRun: false,
	EbsOptimized: false,
	InstanceInitiatedShutdownBehavior: 'terminate',
	InstanceType: 'm3.medium',
	KeyName: 'dml-cloud-ec2-access-portal',
	Monitoring: { Enabled: false },
	Placement: { AvailabilityZone: 'us-east-1a' },
	SecurityGroupIds: ['sg-3619ea4d'],
	SubnetId: 'subnet-44bfd11d',
}

ec2.runInstances(ec2_params, function (err, data) {
	if (err) {
		return console.error(err);
	}
	console.log("Instances Created");
	console.log(data);
});