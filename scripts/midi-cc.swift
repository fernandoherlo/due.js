// Emisor MIDI de prueba (macOS): crea el puerto virtual "due-test" y envia CCs que suben y bajan de 0 a 127.
// Uso: npm run midi -- [canal 1-16] [controlador ...]
// Por defecto envia CC7, CC91 y CC74 para probar doc/examples/live-midi-controls.duejs.
// Ejemplo: npm run midi -- 1 5  ->  envia solo CC5 en canal 1. Recargar la pagina para que el navegador detecte el puerto.
import CoreMIDI
import Foundation

let arguments = Array(CommandLine.arguments.dropFirst())
let rawChannel = arguments.first ?? "1"
guard let channelNumber = Int(rawChannel), (1...16).contains(channelNumber) else {
  fatalError("Channel must be an integer from 1 to 16.")
}

let rawControllers = Array(arguments.dropFirst())
let controllerNumbers = rawControllers.isEmpty ? [7, 91, 74] : rawControllers.compactMap(Int.init)
guard controllerNumbers.count == (rawControllers.isEmpty ? controllerNumbers.count : rawControllers.count),
      !controllerNumbers.isEmpty,
      controllerNumbers.allSatisfy({ (0...127).contains($0) }) else {
  fatalError("Controllers must be integers from 0 to 127.")
}

var client = MIDIClientRef()
MIDIClientCreate("due-test" as CFString, nil, nil, &client)
var source = MIDIEndpointRef()
MIDISourceCreate(client, "due-test" as CFString, &source)

let channel = UInt8(channelNumber - 1)
let controllers = controllerNumbers.map(UInt8.init)

print("Puerto virtual 'due-test'. Enviando CCs \(controllers.map { String($0) }.joined(separator: ", ")) en canal \(channel + 1) (0..127..0). Ctrl+C para salir.")
var value = 0
var step = 4
while true {
  for controller in controllers {
    var packet = MIDIPacket()
    packet.timeStamp = 0
    packet.length = 3
    packet.data.0 = 0xB0 | channel
    packet.data.1 = controller
    packet.data.2 = UInt8(value)
    var list = MIDIPacketList(numPackets: 1, packet: packet)
    MIDIReceived(source, &list)
  }
  print("CCs \(controllers.map { String($0) }.joined(separator: ", ")) = \(value)")
  value += step
  if value >= 127 { value = 127; step = -4 }
  if value <= 0 { value = 0; step = 4 }
  Thread.sleep(forTimeInterval: 0.1)
}
