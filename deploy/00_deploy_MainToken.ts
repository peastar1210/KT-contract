import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import fs from 'fs'

const deployMainToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts()
  const { deploy, get } = hre.deployments

  console.log('deployer', deployer)

  await deploy('MainToken', {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  })

  const mainToken = await get('MainToken')

  const data = {
    address: mainToken.address.substring(2),
    abi: mainToken.abi,
  }
  console.log(mainToken.address)

  //This writes the ABI and address to the marketplace.json
  //This data is then used by frontend files to connect with the smart contract
  fs.writeFileSync(
    '../kata-frontend/contracts/MainToken.json',
    JSON.stringify(data)
  )
}

export default deployMainToken

deployMainToken.tags = ['MainToken']
